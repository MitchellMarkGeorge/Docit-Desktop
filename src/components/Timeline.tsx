import {
  Table,
  Position,
  MoreIcon,
  Popover,
  Menu,
  IconButton,
} from "evergreen-ui";
import React from "react";
import { ProjectVersions, Version, ViewedVersion } from "../core/types";

interface TimelineProps {
  versions: ProjectVersions;
  currentVersion: string;
  viewVersion: (currentVersion: ViewedVersion) => void;
  peekVersion: (version: Version, versionNumber: string) => void;
  rollBackVersion: (versionNumber: string) => void;
}

export function Timeline({
  versions,
  currentVersion,
  viewVersion,
  peekVersion,
  rollBackVersion,
}: TimelineProps) {
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
                intent={currentVersion === versionNumber ? "success" : null}
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
                        <Menu.Item
                          onSelect={() =>
                            peekVersion(versions[versionNumber], versionNumber)
                          }
                        >
                          Peek Version
                        </Menu.Item>
                        {currentVersion !== versionNumber && (
                          <Menu.Item
                            onSelect={() => rollBackVersion(versionNumber)}
                          >
                            Rollback to this version
                          </Menu.Item>
                        )}

                        <Menu.Item
                          onSelect={() =>
                            viewVersion({
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
