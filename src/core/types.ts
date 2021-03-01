export interface ProjectConfig {
  documentPath: string;
  currentVersion: string;
  latestVersion: string;
}

export interface ProjectVersions {
  [version: string]: Version;
}

export interface Version {
  file_hash: string;
  comments: string;
  date: number;
}

export interface ViewedVersion extends Version {
  version_number: string; // should the version object be a seperate key?
}

