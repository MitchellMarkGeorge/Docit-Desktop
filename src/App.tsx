import React, { Component } from "react";

import * as internals from "./core/internals";
import Box from "ui-box";

import { Pane, Button, Table } from "evergreen-ui";
import path from "path";
import { NoProjects, NoSelectedProject } from "./components/components";
import { NewProjectModal } from "./modals/NewProject";
import { ipcRenderer } from "electron";
import TimelineView from "./TimelineView";
// should integrate with CLI
interface State {
  projects?: string[];
  currentAlias?: string; // save last opened project
  showNewProjectModal?: boolean;
  showNewVersionModal?: boolean;
}

export default class App extends Component<{}, State> {
  state: State = { projects: [] };
  documentPath: string;

  async componentDidMount() {
    this.addIpcListeners();
    const lastOpenedProject: string = await ipcRenderer.invoke("last-opened-project");
    this.setState({
      projects: internals.getProjects(),
      currentAlias: lastOpenedProject,
    });
    // saves the last oppened project
    window.addEventListener("beforeunload", () => {
      ipcRenderer.send("save-last-opened-project", this.state.currentAlias);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners("document-selected");
  }

  createNewProject = (alias: string) => {
    this.setState({ showNewProjectModal: false }, () => {
      const extension = path.extname(this.documentPath);
      alias =
        alias || path.basename(this.documentPath, extension).toLowerCase();
      internals.createInitalFiles(alias, this.documentPath);
      this.setState({
        projects: [...this.state.projects, alias],
      });
    });
  };

  addIpcListeners = () => {
    ipcRenderer.on(
      "document-selected",
      (event, args: { canceled: boolean; documentPath: string }) => {
        console.log(args);
        if (args.canceled || !args.documentPath) return;
        this.documentPath = args.documentPath;
        this.setState({ showNewProjectModal: true });
      }
    );
  };

  selectProject = (alias: string) => {
    // console.log(alias);
    this.setState({ currentAlias: alias });
  };

  openFileDialog = () => {
    ipcRenderer.send("select-document");
  };

  render() {
    return (
      <>
        <NewProjectModal
          isShown={this.state.showNewProjectModal}
          onConfirm={this.createNewProject}
          onClose={() => {
            this.setState({ showNewProjectModal: false });
            this.documentPath = undefined; // is this needed
          }}
        />

        <Box
          height="100%"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridTemplateRows="auto 50px"
        >
          <Pane
            gridColumn="span 3"
            background="tint1"
            borderRight
            borderTop
            // overflow="auto"
            height="100%"
          >
            {this.state?.projects?.length > 0 ? (
              // figure out Context.Provider value issue (might be internal)

              this.state.projects.map((projectAlias, index) => (
                <Table.Row
                  isSelectable
                  isHighlighted={this.state.currentAlias === projectAlias}
                  key={index}
                  onSelect={() => {
                    this.selectProject(projectAlias);
                  }}
                >
                  <Table.TextCell textProps={{ fontSize: "1rem" }}>
                    {projectAlias}
                  </Table.TextCell>
                </Table.Row>
              ))
            ) : (
              <NoProjects />
            )}
          </Pane>

          <Pane
            gridColumn="span 9"
            backgroundColor="white"
            height="100%"
            width="100%"
            overflow="auto"
            borderTop
          >
            {this.state.currentAlias ? (
              <TimelineView
                alias={this.state.currentAlias}
                key={this.state.currentAlias}
              /> // the key renders each indeividal product seperatly, instaead of updating
            ) : (
              <NoSelectedProject />
            )}
          </Pane>

          <Pane
            gridColumn="span 12"
            borderTop
            display="flex"
            alignItems="center"
          >
            <Button
              appearance="primary"
              intent="success"
              marginLeft="1rem"
              onClick={this.openFileDialog}
            >
              New Project
            </Button>
          </Pane>
        </Box>
      </>
    );
  }
}
