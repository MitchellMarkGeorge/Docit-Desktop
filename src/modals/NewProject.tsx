import { Dialog, TextInputField, Checkbox } from "evergreen-ui";
import React from "react";
import Box from "ui-box";
import path from "path";
import { pathExistsSync } from "fs-extra";
import { DOCIT_PATH } from "../core/internals";

interface Props {
  isShown: boolean;
  onConfirm: (alias: string) => void;
  onClose: () => void; 
}

export function NewProjectModal({ isShown, onConfirm, onClose }: Props) {
  const [value, setValue] = React.useState("");
  const [shouldUseAlias, setShouldUseAlias] = React.useState(false);
  const [isInValid, setIsInValid] = React.useState(false);

  function validateValue(value: string) {
      if (!value) return;

    setValue(value);
    if (isInValid) {
      setIsInValid(false);
    }

    // console.log(pathExistsSync(path.join(DOCIT_PATH, value)))

    if (pathExistsSync(path.join(DOCIT_PATH, value))) {
      setIsInValid(true);
    }
  }
  return (
    <Dialog onCloseComplete={onClose} isShown={isShown} title="New Project" intent="success" confirmLabel="Create Project" onConfirm={() => onConfirm(value.trim())}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box textAlign="center">
          
            <Checkbox
              label="Use Project Alias (a better name to access your project)"
              checked={shouldUseAlias}
              onChange={(e) => setShouldUseAlias(e.target.checked)}
            />
          

          {shouldUseAlias && (
            <TextInputField
              isInvalid={isInValid}
              label="Project Alias"
              placeholder="Project Alias"
              value={value}
              display="block"
              onChange={(e) => validateValue(e.target.value)}
              marginBottom="1rem"
              validationMessage={ isInValid ? "Project with the same alias already exists" : null}
            />
          )}

        </Box>
      </Box>
    </Dialog>
  );
}


