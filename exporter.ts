import {
  BaseExporter,
  Resources,
  DataTransformation,
} from "@botmock/export";

export class KringExporter extends BaseExporter {
  #rootTransformation = (resources: Resources): DataTransformation => {
    return [
      {
        filename: `${resources.project.name}.lg`,
        data: {},
      }
    ];
  };
  /**
   * For more on data transformations, see the {@link https://github.com/Botmock/sdk/tree/master/packages/export#custom-exporters-example docs}.
   */
  dataTransformations = new Map([
    ["./", this.#rootTransformation],
  ]);
}
