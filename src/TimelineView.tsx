import {
  Heading,
  Pane,
  Text,
  Table,
  IconButton,
  MoreIcon,
  Popover,
  Menu,
  Position,
  Button,
  toaster,
} from "evergreen-ui";
import React, { Component } from "react";
import Box from "ui-box";
import * as internals from "./core/internals";
import { ProjectConfig, ProjectVersions } from "./core/types";
import NewVersion from "./modals/NewVersion";
import { VeiwVersion } from "./modals/VeiwVersion";

interface Props {
  alias: string;
}
interface State {
  versions?: ProjectVersions;
  config?: ProjectConfig;
  showVersionModal?: boolean;
  showNewVersionModal?: boolean;
  currentViewedVersion?: {
    file_hash: string;
    comments: string;
    date: number;
    version_number: string;
  };
}

export default class TimelineView extends Component<Props, State> {
  state: State = { showVersionModal: false };

  componentDidMount() {
    const { alias } = this.props;
    this.setState({
      versions: internals.getProjectVersions(alias),
      config: internals.getProjectConfig(alias),
    });
    // console.log(internals.getProjectVersions(this.props.alias));
  }

  viewVersion = (currentVersion: any) => {
    this.setState({
      showVersionModal: true,
      currentViewedVersion: currentVersion,
    });
  };

  closeDialog = () => {
    this.setState({ showVersionModal: false });
  };

  onConfirm = (comments: string) => {
    const { config, versions } = this.state;
    try {
      const newVersions = internals.new_version(
        this.props.alias,
        config,
        versions,
        comments
      );
      this.setState({ showNewVersionModal: false, versions: newVersions });
    } catch (error) {
      console.log(error);
      toaster.danger("Changes must be mande before new version is made");
    }
  };

  peekVersion = (version: any, versionNumber: string) => {
    const { config } = this.state;
      internals.peek(this.props.alias, versionNumber, config, version);
      toaster.success("Successfully made file")
  }

  render() {
    return (
      <>
        <VeiwVersion
          onClose={this.closeDialog}
          version={this.state?.currentViewedVersion}
          isShown={this.state?.showVersionModal}
        />

        <NewVersion
          isShown={this.state?.showNewVersionModal}
          onConfirm={this.onConfirm}
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
            <Heading size={900}>{this.props.alias}</Heading>
            <Button
              intent="success"
              marginLeft="auto"
              appearance="primary"
              onClick={() => this.setState({ showNewVersionModal: true })}
            >
              New Version
            </Button>
          </Box>

          {/* <Box height="100%"> */}

          {this.state?.versions && Object.keys(this.state?.versions).length ? (
            <Timeline
              onSelect={this.viewVersion}
              currentVersion={this.state.config.currentVersion}
              versions={this.state.versions}
              peekVersion={this.peekVersion}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center">
              <Text size={300}>There are not versions to display.</Text>
            </Box>
          )}
          {/* <Timeline /> */}
          {/* </Box> */}
        </Box>
      </>
    );
  }
}

interface TimelineProps {
  versions: ProjectVersions;
  currentVersion: string;
  onSelect: (currentVersion: any) => void;
  peekVersion: (version: any, versionNumber: string) => void
}

function Timeline({ versions, currentVersion, onSelect, peekVersion }: TimelineProps) {
  return (
    <Table>
      <Table.Head>
        <Table.TextHeaderCell>Version</Table.TextHeaderCell>
        <Table.TextHeaderCell>Date Created</Table.TextHeaderCell>
        <Table.TextHeaderCell>Comments</Table.TextHeaderCell>
      </Table.Head>
      <Table.Body height="90%">
        {Object.keys(versions)
          .reverse()
          .map((versionNumber, index) => {
            const { comments, date } = versions[versionNumber];

            return (
              <Table.Row
                // isSelectable

                intent={currentVersion === versionNumber ? "success" : null}
                //   background="white"
                key={index}
              >
                <Table.TextCell>{versionNumber}</Table.TextCell>
                <Table.TextCell>{new Date(date).toDateString()}</Table.TextCell>
                <Table.TextCell textOverflow="ellipsis">
                  {comments || "No Comments"}
                </Table.TextCell>
                <Table.Cell flex="none">
                  <Popover
                    content={
                      <Menu.Group>
                        <Menu.Item onSelect={() => peekVersion(versions[versionNumber], versionNumber)}>Peek Version</Menu.Item>
                        <Menu.Item
                          onSelect={() =>
                            onSelect({
                              ...versions[versionNumber],
                              version_number: versionNumber,
                            })
                          }
                        >
                          More Info
                        </Menu.Item>
                      </Menu.Group>
                    }
                    position={Position.BOTTOM_RIGHT}
                  >
                    <IconButton
                      icon={MoreIcon}
                      height={24}
                      appearance="minimal"
                    />
                  </Popover>
                </Table.Cell>
              </Table.Row>
            );
          })}
      </Table.Body>
    </Table>
  );
}
