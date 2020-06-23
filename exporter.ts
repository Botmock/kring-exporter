import {
  BaseExporter,
  Resources,
  DataTransformation,
  Botmock,
} from "@botmock/export";

namespace MSBotFramework {
  export interface SchemaContent { }
}

export class KringExporter extends BaseExporter {
  #schemaMap: Map<string, string> = new Map([
    ["card", ""],
    ["button", ""],
    ["quick_replies", ""],
  ]);
  #createSchemaForContentBlock = (block: Botmock.Block): MSBotFramework.SchemaContent => {
    return {};
  };
  #createTemplatesFromProjectResources = (resources: Resources) => {
    return {};
  };
  /**
   * Generates `.lg` file content and `.json` schema content for applicable blocks.
   * @param resources Object containing botmock resources.
   */
  #rootTransformation = (resources: Resources): DataTransformation => {
    const payloadsContainingSchemaContent = (resources.board.board.messages as Botmock.Message[])
      .reduce((payloads, message) => {
        const valuesByPlatform = Object.values(message.payload);
        const schemaContent: MSBotFramework.SchemaContent[] = valuesByPlatform
          .flatMap(value => Object.values(value).flatMap(b => b.blocks))
          .filter(block => this.#schemaMap.has(block.component_type))
          .map(this.#createSchemaForContentBlock);
        return {
          ...payloads,
          [message.message_id]: schemaContent,
        };
      }, {});
    return [
      {
        filename: `${resources.project.name}.lg`,
        data: this.#createTemplatesFromProjectResources(resources),
      },
      ...Object.keys(payloadsContainingSchemaContent).map(key => ({
        filename: `${key}.json`,
        // @ts-ignore
        data: payloadsContainingSchemaContent[key],
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
