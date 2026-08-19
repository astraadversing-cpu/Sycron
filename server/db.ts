import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const databasePath = process.env.DATABASE_PATH || path.resolve(currentDir, '../data/sycron.json');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

type StoredEntity = { id: string; collection: string; payload: string; createdAt: string; updatedAt: string };

const readStore = (): StoredEntity[] => {
  if (!fs.existsSync(databasePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(databasePath, 'utf8')) as StoredEntity[];
  } catch {
    return [];
  }
};

let store = readStore();

const writeStore = () => {
  const temporaryPath = `${databasePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(temporaryPath, databasePath);
};

export const listEntities = (collection: string) => {
  return store.filter((item) => item.collection === collection).map((item) => JSON.parse(item.payload));
};

export const getEntity = (collection: string, id: string) => {
  const item = store.find((entry) => entry.collection === collection && entry.id === id);
  return item ? JSON.parse(item.payload) : undefined;
};

export const saveEntity = (collection: string, entity: { id: string }) => {
  const now = new Date().toISOString();
  const index = store.findIndex((item) => item.collection === collection && item.id === entity.id);
  const item = { id: entity.id, collection, payload: JSON.stringify(entity), createdAt: index >= 0 ? store[index].createdAt : now, updatedAt: now };
  if (index >= 0) store[index] = item;
  else store.push(item);
  writeStore();
  return entity;
};

export const deleteEntity = (collection: string, id: string) => {
  const originalLength = store.length;
  store = store.filter((item) => !(item.collection === collection && item.id === id));
  if (store.length === originalLength) return false;
  writeStore();
  return true;
};
