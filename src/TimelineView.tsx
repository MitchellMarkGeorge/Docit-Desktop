import { Heading, Text, Button, toaster } from "evergreen-ui";
import React, { Component } from "react";
import Box from "ui-box";
import * as internals from "./core/internals";
import { ProjectConfig, ProjectVersions, Version, ViewedVersion } from "./core/types";
import {NewVersionModal} from "./modals/NewVersion";
import { VeiwVersionModal } from "./modals/VeiwVersion";
import { Timeline } from "./components/Timeline";
import { shell } from "electron";
import { LRUCache } from "./core/cache";

interface Props {
  alias: string;
}
interface State {
  versions?: ProjectVersions;
  config?: ProjectConfig;
  showVersionModal?: boolean;
  showNewVersionModal?: boolean;
  currentViewedVersion?: ViewedVersion;
}

export default class TimelineView extends Component<Props, State> {
  state: State = { showVersionModal: false };

  componentDidMount() {
    
    // I try and cache all the projects so there amount of file reads are reduced
    let cache = LRUCache.getInstance(10);


    const { alias } = this.props;

    let stateObject: State;

    if (cache.has(alias)) {
      console.log("Already in cache");
      stateObject = cache.get(alias);
      
    } else {
      console.log("Not in cache");
      const newStateValue = { 
        versions: internals.getProjectVersions(alias),
        config: internals.getProjectConfig(alias),
      }
      stateObject = newStateValue;
      cache.set(alias, newStateValue); // adds new project to cache
    }

    this.setState(stateObject);


  }

  openDocument = () => {
    shell.openPath(this.state.config.documentPath);
  };

  viewVersion = (currentVersion: ViewedVersion) => {
    this.setState({
      showVersionModal: true,
      currentViewedVersion: currentVersion,
    });
  };

  closeVersionViewModal = () => {
    this.setState({ showVersionModal: false });
  };

  newVersion = (comments: string) => {
    const { config, versions } = this.state;
    try {
      // this includes the new version. 
      //Should i just sent the Version object individually and then setState() ?
      const updatedVersions = internals.new_version(
        this.props.alias,
        config,
        versions,
        comments
      );
      this.setState({ showNewVersionModal: false, versions: updatedVersions });
    } catch (error) {
        console.log(error);
        if (error.message === "No file changes made") {
            toaster.danger("Changes must be made before new version is made");
        } else {
            toaster.danger("Error creating new version. If the file is open, close it");
        }
      
      
    }
  };

  rollbackVersion = (versionNumber: string) => {
    const { config, versions } = this.state; 
    const version = versions[versionNumber];
    try {
      const updatedConfig = internals.rollback(
        this.props.alias,
        versionNumber,
        config,
        version
      );
      toaster.success("Successfully rolledback to version " + versionNumber);
      this.setState({ config: updatedConfig });
    } catch (error) {
      console.log(error);
      toaster.danger("An error occured");
    }
  };

  peekVersion = (version: Version, versionNumber: string) => {
    const { config } = this.state;
    internals.peek(this.props.alias, versionNumber, config, version);
    toaster.success("Successfully made file");
  };

  render() {
    return (
      <>
        <VeiwVersionModal
          onClose={this.closeVersionViewModal}
          version={this.state?.currentViewedVersion}
          isShown={this.state?.showVersionModal}
        />

        <NewVersionModal
          isShown={this.state?.showNewVersionModal}
          onConfirm={this.newVersion}
          onClose={() => {
              this.setState({ showNewVersionModal: false })
          }}
        />

        <Box
          padding="1rem"
          height="100%"
          display="grid"
          overflow="auto"
          gap="0.5rem"
          // gridTemplateColumns="repeat(12, 1fr)"
          gridTemplateRows="10% 90%"
        >
          <Box display="flex" alignItems="center">
            <Heading onDoubleClick={this.openDocument} size={900}>
              {this.props.alias}
            </Heading>
            <Button
              intent="success"
              marginLeft="auto"
              appearance="primary"
              textOverflow="ellipsis"
              onClick={() => this.setState({ showNewVersionModal: true })}
            >
              New Version
            </Button>
          </Box>

          

          {this.state?.versions && Object.keys(this.state?.versions).length ? (
            <Timeline
              rollBackVersion={this.rollbackVersion}
              viewVersion={this.viewVersion}
              currentVersion={this.state.config.currentVersion}
              versions={this.state.versions}
              peekVersion={this.peekVersion}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center">
              <Text size={300}>There are not versions to display.</Text>
            </Box>
          )}
        </Box>
      </>
    );
  }
}

