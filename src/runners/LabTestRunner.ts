import { join } from "path";
import { debug, WorkspaceFolder } from "vscode";

import { ITestRunnerInterface } from "../interfaces/ITestRunnerInterface";
import { ITestRunnerOptions } from "../interfaces/ITestRunnerOptions";
import { ConfigurationProvider } from "../providers/ConfigurationProvider";
import { TerminalProvider } from "../providers/TerminalProvider";

export class LabTestRunner implements ITestRunnerInterface {
  public name: string = "lab";
  public terminalProvider: TerminalProvider = null;
  public configurationProvider: ConfigurationProvider = null;

  get binPath(): string {
    return join("node_modules", ".bin", "lab");
  }

  constructor({ terminalProvider, configurationProvider }: ITestRunnerOptions) {
    this.terminalProvider = terminalProvider;
    this.configurationProvider = configurationProvider;
  }

  public runTest(
    rootPath: WorkspaceFolder,
    fileName: string,
    testName: string
  ) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider
      .environmentVariables;
    // We force slash instead of backslash for Windows
    const cleanedFileName = fileName.replace(/\\/g, "/");

    const command = `${
      this.binPath
    } --grep "${testName}" ${cleanedFileName} ${additionalArguments}`;

    const terminal = this.terminalProvider.get(
      { env: environmentVariables },
      rootPath
    );

    terminal.sendText(command, true);
    terminal.show(true);
  }

  public debugTest(
    rootPath: WorkspaceFolder,
    fileName: string,
    testName: string
  ) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider
      .environmentVariables;
    // We force slash instead of backslash for Windows
    const cleanedFileName = fileName.replace(/\\/g, "/");

    debug.startDebugging(rootPath, {
      args: [
        `--grep`,
        testName,
        cleanedFileName,
        ...additionalArguments.split(" ")
      ],
      console: "integratedTerminal",
      env: environmentVariables,
      name: "Debug Test",
      program: "${workspaceFolder}/node_modules/.bin/lab",
      request: "launch",
      type: "node",
      windows: {
        program: "${workspaceFolder}/node_modules/lab/bin/lab"
      }
    });
  }
}
