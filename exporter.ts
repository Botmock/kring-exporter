import {
  BaseExporter,
  Resources,
  DataTransformation,
} from "@botmock/export";

export class KringExporter extends BaseExporter {
  /**
   * Maps resources to object suitable for writing `.lg` file.
   * @param resources Object containing resources from Botmock project in `.env` file.
   */
  #createTemplatesFromProjectResources = (resources: Resources) => {
    return {};
  };
  /**
   * Associates filenames with object representations of their desired contents.
   * @param resources Object containing resources from Botmock projet in `.env` file.
   */
  #rootTransformation = (resources: Resources): DataTransformation => {
    return [
      {
        filename: `${resources.project.name}.lg`,
        data: this.#createTemplatesFromProjectResources(resources),
      },
    ];
  };
  /**
   * Defines data transformations for the exporter.
   *
   * For more on data transformations,
   * see the {@link https://github.com/Botmock/sdk/tree/master/packages/export#custom-exporters-example docs}.
   */
  dataTransformations = new Map([
    ["./language-generation", this.#rootTransformation],
  ]);
}
