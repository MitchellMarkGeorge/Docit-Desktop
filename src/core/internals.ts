import { ProjectConfig, ProjectVersions, Version } from "./types";
import path from "path";
import { homedir } from "os";
import fse from "fs-extra";
import zlib from "zlib";
import hasha from "hasha";

// import * as fs from "fs/promises";


export const DOCIT_PATH = path.join(homedir(), ".docit");

export function PROJECT_PATH(alias: string) {
  return path.join(DOCIT_PATH, alias);
}

export function VERSIONS_PATH(alias: string) {
  return path.join(PROJECT_PATH(alias), "versions");
}

export function CONFIG_PATH(alias: string) {
  return path.join(PROJECT_PATH(alias), "config.json");
}

export function createInitalFiles(alias: string, documentPath: string) {
  const folderpath = path.join(DOCIT_PATH, alias);
  const initalConfig: ProjectConfig = {
    documentPath: documentPath, //
    currentVersion: "0.0",
    latestVersion: "0.0",
  };

  fse.outputJSONSync(path.join(folderpath, "config.json"), initalConfig);
}

export function getProjectConfig(alias: string): ProjectConfig {
  return fse.readJSONSync(CONFIG_PATH(alias));
}

export function getProjectVersions(alias: string): ProjectVersions {
  if (fse.pathExistsSync(VERSIONS_PATH(alias))) {
    const buffer = fse.readFileSync(VERSIONS_PATH(alias));
    const decompressed_buffer = zlib.brotliDecompressSync(buffer); // or use normal decompress
    return JSON.parse(decompressed_buffer.toString());
  } else {
    return {};
  }
}

export function getProjects(): string[] {
  if (!fse.pathExistsSync(DOCIT_PATH)) {
    return []; // should i make the docit dir???
   
  }
  return fse
    .readdirSync(DOCIT_PATH)
    .filter(
      (localpath) =>
        fse.statSync(path.join(DOCIT_PATH, localpath)).isDirectory() &&
        localpath !== ".config"
    );
}

export function saveConfigFile(config: ProjectConfig, alias: string) {
  // not compressing as config file will remain very small
  fse.outputJSONSync(CONFIG_PATH(alias), config);
}

export function saveVersionsFile(versions: ProjectVersions, alias: string) {
  const versionsBuffer = Buffer.from(JSON.stringify(versions));
  const compressedVersionsBuffer = zlib.brotliCompressSync(versionsBuffer);
  fse.outputFileSync(VERSIONS_PATH(alias), compressedVersionsBuffer);
}

export function peek(alias: string, versionNumber: string, config: ProjectConfig, version: Version) {
  

  
    // get the file from the requested file object
    const { file_hash } = version;

    // get the compressed buffer from version_files using the hash (the saved compressed file of the version)
    // this can be turned into seperate functions
    const compressedBuffer = fse.readFileSync(
      path.join(PROJECT_PATH(alias), "version_files", file_hash)
    );

    // decompress the buffer
    const decompressedBuffer = zlib.brotliDecompressSync(compressedBuffer);

    // get the parent directory name, so the "peek" can be written in the same location
    const parentDirname = path.dirname(config.documentPath);
    // get the document name of the tracked file (without the extension), to create a modified file name for the peeked file
    const documentName = getFileName(config.documentPath);
    // write the new peeked file
    //e.g: vesion = 5 test.docx -> test v5.docx
    const peekedFilePath = path.join(
      parentDirname,
      `${documentName} v${versionNumber}.docx`
    );
    fse.writeFileSync(peekedFilePath, decompressedBuffer);

  
}

export function new_version(alias: string, config: ProjectConfig, versions: ProjectVersions, comments: string): ProjectVersions {
  // update version number


  const pastVersion = config.latestVersion || "0.0"; //
  const newVersion = (parseFloat(pastVersion) + 1.0).toString();

  // read the document (get a buffer) and generate a hash from it
  const documentBuffer = fse.readFileSync(config.documentPath);
  const file_hash = hasha(documentBuffer, { algorithm: "sha1" }); // for now // truncate it
  // Dosen't let the user create a new version of the file has the same content (what the hashes are made from)
  if (versions[config.currentVersion]?.file_hash === file_hash) {
    // basically a checksum
    throw new Error("No file changes made");
  }
  // should i let the user still create a new version if no changes were made

  // compress the given buffer and get write that compressed buffer to the version_filed directory
  // (with the name as the hash)
  const compressedDocumentBuffer = zlib.brotliCompressSync(documentBuffer);

  fse.outputFileSync(
    path.join(PROJECT_PATH(alias), "version_files", file_hash),
    compressedDocumentBuffer
  );

  // add version to version object
  versions[newVersion] = {
    file_hash,
    date: Date.now(),
    comments,
  };

  config.currentVersion = newVersion;
  config.latestVersion = newVersion;

  saveConfigFile(config, alias);
  saveVersionsFile(versions, alias);

  return versions;
}

function getFileName(filepath: string) {
  const extension = path.extname(filepath);
  return path.basename(filepath, extension)
}

// export function rollback(alias: string, versionNumber: string, config: ProjectConfig, versions: ProjectVersions): ProjectConfig {
  
//     // get the file from the requested version object
//     const { file_hash } = versions[versionNumber];

//     // get the compressed buffer from version_files using the hash (the saved compressed file of the version)
//     // this can be turned into seperate functions
//     const compressedBuffer = fse.readFileSync(
//       path.join(PROJECT_PATH(alias), "version_files", file_hash)
//     );

//     // decompress the buffer
    
//     const decompressedBuffer = zlib.brotliDecompressSync(compressedBuffer);

//     fse.writeFileSync(config.documentPath, decompressedBuffer);

//     config.currentVersion = versionNumber;

//     saveConfigFile(config, alias);
//     return config;

    
 
// }

export function rollback(alias: string, versionNumber: string, config: ProjectConfig, version: Version): ProjectConfig {
  
  // get the file from the requested version object
  const { file_hash } = version;

  // get the compressed buffer from version_files using the hash (the saved compressed file of the version)
  // this can be turned into seperate functions
  const compressedBuffer = fse.readFileSync(
    path.join(PROJECT_PATH(alias), "version_files", file_hash)
  );

  // decompress the buffer
  
  const decompressedBuffer = zlib.brotliDecompressSync(compressedBuffer);

  fse.writeFileSync(config.documentPath, decompressedBuffer);

  config.currentVersion = versionNumber;

  saveConfigFile(config, alias);
  return config;

  

}

