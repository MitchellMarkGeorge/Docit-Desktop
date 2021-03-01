import React from "react";
import Box from "ui-box";
import { Dialog, Paragraph } from "evergreen-ui";
import { ProjectVersions, ViewedVersion } from "../core/types";

interface Props {
  isShown: boolean;
  version: ViewedVersion;
  onClose: () => void
}

export function VeiwVersionModal(props: Props) {
//   const { comments, date, file_hash, version_number } = props?.version;
  return (
    <Dialog
      title={`Version ${props?.version?.version_number}`}
      isShown={props.isShown}
      hasFooter={false}
      onCloseComplete={props.onClose}
    >
      <Paragraph marginBottom="1rem">Date Created: {new Date(props?.version?.date).toDateString()}</Paragraph>
      <Paragraph marginBottom="1rem">File Hash (for nerds): {props?.version?.file_hash}</Paragraph>
      <Paragraph>Comments: {props?.version?.comments || "No comments"}</Paragraph>
    </Dialog>
  );
};
