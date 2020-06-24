import {
  BaseExporter,
  Resources,
  DataTransformation,
  Botmock,
} from "@botmock/export";
import { v4 } from "uuid";
import { MSBotFramework } from "./types";

export class KringExporter extends BaseExporter {
  #adaptiveCardJSONMap: Map<string, string> = new Map([]);
  #schemaMap: Map<string, string> = new Map([
    [Botmock.Component.button, MSBotFramework.BodyTypes.CHOICE],
    [Botmock.Component.quick_replies, MSBotFramework.BodyTypes.CHOICE],
  ]);
  #createSchemaForContent = (block: Botmock.Block): MSBotFramework.SchemaContent => {
    return {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.0",
      body: [
        {
          type: MSBotFramework.BodyTypes.TEXT,
          text: block.text || "",
        },
        {
          type: MSBotFramework.BodyTypes.CHOICE,
          id: v4(),
          style: "compact",
          isMultiSelect: false,
          value: "",
          choices: (block.buttons || block.quick_replies as any[]).map(value => {
            return {
              title: value.title,
              value: value.title,
            };
          })
        }
      ],
    };
  };
  #replaceEntityCharacters = (input: string): string => {
    const processedInput = input.split("");
    let numCaptured = 0;
    let i = 0;
    for (const char of processedInput) {
      if (char === "%") {
        if (numCaptured % 2 === 0) {
          processedInput[i] = "${";
        } else {
          processedInput[i] = "}";
        }
        numCaptured += 1;
      }
      i += 1;
    }
    return processedInput.join("");
  };
  #createTemplatesFromProjectResourcesAndSchemaAssociations = (resources: Resources, schemaAssociations: {}) => {
    const unwrapValuesFromPayload = (payload: Botmock.Message["payload"]) => {
      return Object.values(payload)
        .flatMap(value =>
          Object.values(value).flatMap(v =>
            v.blocks.map(block => [block.text, ...block.alternate_replies || []]
              .filter(input => typeof input === "string")
              .map(input => this.#replaceEntityCharacters(input as string)))
          )
        );
    };
    return (resources.board.board.messages as Botmock.Message[]).reduce((obj, message) => {
      const result = {
        ...obj,
        [message.message_id]: unwrapValuesFromPayload(message.payload)
      };
      if (message.next_message_ids.some(n => n.action !== "*" as any)) {
        (result as any)[`${message.message_id}_outcomes`] = {
          conditions: message.next_message_ids
            .filter(n => n.action !== "*" as any)
            .map(n => {
              let pair: [string, string] = [`\${userInput == ${n.action.payload}}`, ``];
              const nextMessage = (resources.board.board.messages as Botmock.Message[]).find(message => message.message_id === n.message_id);

              if (this.#schemaMap.get((nextMessage as any).message_type)) {
                pair[1] = `\${${this.#adaptiveCardJSONMap.get((nextMessage as Botmock.Message).message_id)}}()`;
              } else {
                pair[1] = unwrapValuesFromPayload((nextMessage as Botmock.Message).payload).join(", ");
              }
              return pair;
            })
        };
      }
      return result;
    }, Object.keys(schemaAssociations).reduce((associations, messageId, i) => {
      const key = `adaptivecardjson_${i + 1}`;
      this.#adaptiveCardJSONMap.set(messageId, key);
      return {
        ...associations,
        [key]: [`\${json(fromFile("./${messageId}.json"))}`],
      };
    }, {}));
  };
  #generateSchemaAssociations = (messages: Botmock.Message[]) => {
    return messages.reduce((payloads, message) => {
      const valuesByPlatform = Object.values(message.payload);
      const schemaContent: MSBotFramework.SchemaContent[] = valuesByPlatform
        .flatMap(value => Object.values(value).flatMap(v => v.blocks))
        .filter(block => this.#schemaMap.has(block.component_type))
        .map(this.#createSchemaForContent);
      if (!schemaContent.length) {
        return payloads;
      }
      return {
        ...payloads,
        [message.message_id]: schemaContent,
      };
    }, {}) as { [messageId: string]: MSBotFramework.SchemaContent; };
  };
  /**
   * Generates `.lg` file content and `.json` schema content for applicable blocks.
   * @param resources Object containing botmock resources.
   */
  #rootTransformation = (resources: Resources): DataTransformation => {
    const payloadsContainingSchemaContent = this.#generateSchemaAssociations(resources.board.board.messages);
    return [
      {
        filename: `${resources.project.name}.lg`,
        data: this.#createTemplatesFromProjectResourcesAndSchemaAssociations(resources, payloadsContainingSchemaContent),
      },
      ...Object.keys(payloadsContainingSchemaContent).map(messageId => ({
        filename: `${messageId}.json`,
        data: payloadsContainingSchemaContent[messageId],
      })),
    ];
  };
  /**
   * Defines {@link https://github.com/Botmock/sdk/tree/master/packages/export#custom-exporters-example data transformations} for the exporter.
   */
  dataTransformations = new Map([
    ["./language-generation", this.#rootTransformation],
  ]);
}
