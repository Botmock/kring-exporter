import {
  BaseExporter,
  Resources,
  DataTransformation,
  Botmock,
} from "@botmock/export";
import { v4 } from "uuid";
import { MSBotFramework } from "./types";

export class KringExporter extends BaseExporter {
  #templateMap: Map<string, string> = new Map();
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
  #createTemplatesFromProjectResourcesAndSchemaContent = (resources: Resources, schemaContent: {}) => {
    return (resources.board.board.messages as Botmock.Message[]).reduce((obj, message) => {
      return {
        ...obj,
        [message.message_id]: ["x"]
      };
    }, {});
  };
  #generateSchemaContent = (messages: Botmock.Message[]) => {
    return messages.reduce((payloads, message) => {
      const valuesByPlatform = Object.values(message.payload);
      const schemaContent: MSBotFramework.SchemaContent[] = valuesByPlatform
        .flatMap(value => Object.values(value).flatMap(b => b.blocks))
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
    const payloadsContainingSchemaContent = this.#generateSchemaContent(resources.board.board.messages);
    return [
      {
        filename: `${resources.project.name}.lg`,
        data: this.#createTemplatesFromProjectResourcesAndSchemaContent(resources, payloadsContainingSchemaContent),
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
