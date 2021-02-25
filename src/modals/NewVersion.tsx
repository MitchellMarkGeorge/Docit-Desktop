import { Dialog, Button, TextInputField, Checkbox } from "evergreen-ui";
import React, { ReactElement } from "react";
import Box from "ui-box";
import path from "path";
import { pathExistsSync } from "fs-extra";
import { DOCIT_PATH } from "../core/internals";

interface Props {
  isShown: boolean;
  onConfirm: (comments: string) => void;
}

function NewVersion({ isShown, onConfirm }: Props): ReactElement {
  const [value, setValue] = React.useState("");
  const [shouldUseComments, setShouldUseComments] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Dialog
      isShown={isShown}
      title="New Project"
      intent="success"
      confirmLabel={isLoading ? "Loading..." : "Create New Version"}
      onConfirm={() => {
        setIsLoading(true);
        onConfirm(value.trim());
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box textAlign="center">
          <Checkbox
            label="Add Comments"
            checked={shouldUseComments}
            onChange={(e) => setShouldUseComments(e.target.checked)}
          />

          {shouldUseComments && (
            <TextInputField
              label="Version Comments"
              placeholder="Version Comments"
              value={value}
              display="block"
              onChange={(e) => setValue(e.target.value)}
              marginBottom="1rem"
            />
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

export default NewVersion;
