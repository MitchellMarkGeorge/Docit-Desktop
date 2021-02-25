export interface ProjectConfig {
  documentPath: string;
  currentVersion: string;
  latestVersion: string;
}

export interface ProjectVersions {
  [version: string]: {
    file_hash: string;
    comments: string;
    date: number;
  };
}

export interface Version {
  file_hash: string;
  comments: string;
  date: number;
}
