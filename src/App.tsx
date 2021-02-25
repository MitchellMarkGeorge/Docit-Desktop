import React, { Component } from "react";

import * as internals from "./core/internals";
import Box from "ui-box";

import { Pane, Button, Table } from "evergreen-ui";
import path from "path";
import { NoProjects, NoSelectedProject } from "./components";
import NewProject from "./modals/NewProject";
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
  documentPath: string; // put in state??

  componentDidMount() {
    console.log(internals.getProjects());
    this.addIpcListeners();
    this.setState({ projects: internals.getProjects() }, () =>
      console.log(this.state)
    );
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
    // this.setState({ showNewProjectModal: true});
    ipcRenderer.send("select-document");
  };

  render() {
    return (
      <>
        <NewProject
          isShown={this.state.showNewProjectModal}
          onConfirm={this.createNewProject}
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
            {/* {!this.state?.projects?.length && (
              // <Box
              //   height="100%"
              //   display="flex"
              //   justifyContent="center"
              //   alignItems="center"
              // >
              //   <Text>No Projects</Text>
              // </Box>

              <NoProjects />
            )} */}

            {this.state?.projects?.length > 0 ? (
              // figure out Context.Provider value issue

              this.state.projects.map((project, index) => (
                <Table.Row
                  isSelectable
                  key={index}
                  onSelect={() => {
                    this.selectProject(project);
                  }}
                >
                  <Table.TextCell textProps={{ fontSize: "1rem"}} fontSize="1rem">{project}</Table.TextCell>
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
              /> // use a hash??
            ) : (
              <NoSelectedProject />
            )}
            {/* {this.state.currentAlias && (
              <NoSelectedProject />

              // <Box height="100%" width="100%" padding="1rem">

              //     <Heading size={900}>TEST</Heading>
              // </Box>
              // <Box
              //   height="100%"
              //   display="flex"
              //   justifyContent="center"
              //   alignItems="center"
              // >
              //   <Box textAlign="center">
              //     <Heading size={900} marginBottom="1rem">
              //       Docit
              //     </Heading>

              //     <Text>Manage your Word Documents with ease</Text>
              //   </Box>
              // </Box>
            )} */}
          </Pane>

          <Pane
            gridColumn="span 12"
            borderTop
            display="flex"
            alignItems="center"
            // justifyContent="space-evenly"
          >
            {/* {this.state.currentAlias && (
              <React.Fragment>
                <Button marginLeft="1rem" appearance="primary" intent="success">
                  New Version
                </Button>
                
              </React.Fragment>
            )} */}

            <Button
              appearance="primary"
              intent="success"
              // marginLeft="auto"
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
