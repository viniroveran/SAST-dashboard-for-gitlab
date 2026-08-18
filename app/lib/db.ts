import {Low} from 'lowdb';
import {JSONFile} from 'lowdb/node';
import path from 'path';
import {TrivyReportEntry} from "@/app/types/trivy";
import {ContainerScanReportEntry} from "@/app/types/containerScan";
import {SastReportEntry} from "@/app/types/vulnerability";

interface Data {
  reports: SastReportEntry[];
  trivyReports: TrivyReportEntry[];
  containerScanReports: ContainerScanReportEntry[];
}

const file = path.join(process.cwd(), 'db.json');
const adapter = new JSONFile<Data>(file);
const defaultData: Data = {reports: [], trivyReports: [], containerScanReports: []};
const db = new Low<Data>(adapter, defaultData);

export async function initializeDb() {
  await db.read();
  const defaultData: Data = {
    reports: [],
    trivyReports: [],
    containerScanReports: [],
  };
  if (!db.data) {
    db.data = defaultData;
  } else {
    if (!db.data.trivyReports) db.data.trivyReports = [];
    if (!db.data.containerScanReports) db.data.containerScanReports = [];
  }
  await db.write();
}

export default db;