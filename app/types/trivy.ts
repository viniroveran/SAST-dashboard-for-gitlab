export interface TrivyVulnerability {
  VulnerabilityID: string;
  PkgID: string;
  PkgName: string;
  PkgIdentifier: {
    PURL: string;
    UID: string;
  };
  InstalledVersion: string;
  FixedVersion?: string;
  Status: string;
  Severity: string;
  SeveritySource: string;
  PrimaryURL?: string;
  Title?: string;
  Description?: string;
  CweIDs?: string[];
  References?: string[];
  PublishedDate?: string;
  LastModifiedDate?: string;
  CVSS?: Record<string, {
    V3Vector?: string;
    V3Score?: number;
    V40Vector?: string;
    V40Score?: number;
  }>;
}

export interface TrivyResult {
  Target: string;
  Class: string;
  Type: string;
  Vulnerabilities?: TrivyVulnerability[];
}

export interface TrivyReport {
  SchemaVersion: number;
  ArtifactName: string;
  ArtifactType: string;
  Metadata?: {
    RepoURL?: string;
    Commit?: string;
    CommitMsg?: string;
    Author?: string;
  };
  Results: TrivyResult[];
}

export interface TrivyReportEntry {
  id: string;
  repoName: string;
  timestamp: string;
  data: TrivyReport;
}