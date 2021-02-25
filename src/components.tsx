import React from 'react'
import Box from "ui-box";
import { Heading, Text } from "evergreen-ui";

export const NoProjects = () => {
    return (
        
            <Box
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Text>No Projects</Text>
            </Box>
        
    )
}

export const NoSelectedProject = () => {
    return (
        <Box
              height="100%"
              width="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Box textAlign="center">
                <Heading size={900} marginBottom="1rem">
                  Docit
                </Heading>

                <Text>Manage your Word Documents with ease.</Text>
              </Box>
            </Box>
    )
}


