import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

interface Data {
  reports: { id: string; timestamp: number; repoName: string; data: any }[];
}

const file = path.join(process.cwd(), 'db.json');
const adapter = new JSONFile<Data>(file);
const defaultData: Data = { reports: [] };
const db = new Low<Data>(adapter, defaultData);

export async function initializeDb() {
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
}

export default db;