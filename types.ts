export namespace MSBotFramework {
  export enum BodyTypes {
    TEXT = "TextBlock",
    CHOICE = "Input.ChoiceSet",
  }
  export interface SchemaContent<B = {}> {
    $schema: string;
    type: string;
    version: string;
    body: B[],
  }
}
