import {
  BaseExporter,
  Resources,
  DataTransformation,
  Botmock,
} from "@botmock/export";

export class KringExporter extends BaseExporter {
  #createSchemaForContentBlock = (block: Botmock.Block) => { };
  #createTemplatesFromProjectResources = (resources: Resources) => {
    return {};
  };
  #rootTransformation = (resources: Resources): DataTransformation => {
    return [
      {
        filename: `${resources.project.name}.lg`,
        data: this.#createTemplatesFromProjectResources(resources),
      },
    ];
  };
  /**
   * Defines {@link https://github.com/Botmock/sdk/tree/master/packages/export#custom-exporters-example data transformations} for the exporter.
   */
  dataTransformations = new Map([
    ["./language-generation", this.#rootTransformation],
  ]);
}
