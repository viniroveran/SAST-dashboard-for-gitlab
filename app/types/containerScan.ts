export interface ContainerVulnerability {
  VulnerabilityID: string;
  PkgID: string;
  PkgName: string;
  PkgPath?: string;
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
  Layer?: {
    DiffID: string;
  };
  CVSS?: Record<string, {
    V3Vector?: string;
    V3Score?: number;
    V40Vector?: string;
    V40Score?: number;
  }>;
}

export interface ContainerScanResult {
  Target: string;
  Class: string;
  Type: string;
  Vulnerabilities?: ContainerVulnerability[];
}

export interface ContainerScanReport {
  SchemaVersion: number;
  ArtifactName: string;
  ArtifactType: string;
  Metadata?: {
    OS?: {
      Family: string;
      Name: string;
    };
    RepoTags?: string[];
    Size?: number;
  };
  Results: ContainerScanResult[];
}

export interface ContainerScanReportEntry {
  id: string;
  repoName: string;
  timestamp: string;
  data: ContainerScanReport;
}