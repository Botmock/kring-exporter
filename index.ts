import "dotenv/config";
import {
  FileWriter,
  Kind,
  ProjectReference,
  BotFrameworkExporter,
} from "@botmock/export";

const projectReference: ProjectReference = {
  teamId: process.env.TEAM_ID as string,
  projectId: process.env.PROJECT_ID as string,
  boardId: process.env.BOARD_ID as string,
};

/**
 * @example
 * ```shell
 * npm start
 * ```
 */
async function main(): Promise<void> {
  const exporter = new BotFrameworkExporter({ token: process.env.TOKEN as string });
  const { data } = await exporter.exportProjectUnderDataTransformations({ projectReference });
  const writeResult = await (new FileWriter({ directoryRoot: "./language-generation" })).writeAllResourcesToFiles({ data });
  if (writeResult.kind !== Kind.OK) {
    console.error(writeResult.value);
  } else {
    console.log("done");
  }
}

process.on("unhandledRejection", () => { });
process.on("uncaughtException", () => { });

main().catch((err: Error) => {
  console.error(err);
});
