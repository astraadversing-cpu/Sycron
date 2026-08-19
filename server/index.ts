import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import { deleteEntity, getEntity, listEntities, saveEntity } from './db';

const app = express();
const port = Number(process.env.PORT || 8787);
const collections = [
  'users', 'regions', 'nodes', 'connections', 'alerts', 'news', 'channels',
  'participants', 'auditLogs', 'reports', 'invoices', 'notifications',
] as const;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  next();
});
app.options('*', (_req, res) => res.sendStatus(204));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sycron-api', timestamp: new Date().toISOString() });
});

app.get('/api/collections', (_req, res) => {
  res.json(Object.fromEntries(collections.map((collection) => [collection, listEntities(collection)])));
});

app.get('/api/:collection', (req, res) => {
  if (!collections.includes(req.params.collection as (typeof collections)[number])) {
    return res.status(404).json({ error: 'Coleção não encontrada' });
  }
  return res.json(listEntities(req.params.collection));
});

app.get('/api/:collection/:id', (req, res) => {
  const entity = getEntity(req.params.collection, req.params.id);
  return entity ? res.json(entity) : res.status(404).json({ error: 'Registro não encontrado' });
});

app.post('/api/:collection', (req, res) => {
  if (!collections.includes(req.params.collection as (typeof collections)[number])) {
    return res.status(404).json({ error: 'Coleção não encontrada' });
  }
  const entity = { ...req.body, id: req.body.id || crypto.randomUUID() };
  return res.status(201).json(saveEntity(req.params.collection, entity));
});

app.patch('/api/:collection/:id', (req, res) => {
  const existing = getEntity(req.params.collection, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Registro não encontrado' });
  return res.json(saveEntity(req.params.collection, { ...existing, ...req.body, id: req.params.id }));
});

app.delete('/api/:collection/:id', (req, res) => {
  return deleteEntity(req.params.collection, req.params.id)
    ? res.status(204).send()
    : res.status(404).json({ error: 'Registro não encontrado' });
});

app.use((error: Error, _req: Request, res: Response, _next: unknown) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`SYCRON API listening on http://localhost:${port}`);
});
