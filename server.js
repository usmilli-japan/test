const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFilePreset } = require('lowdb/node');

const app = express();
const port = process.env.PORT || 3001;
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'payments.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function initDb() {
  const defaultData = { payments: [] };
  const adapter = await JSONFilePreset(dbFile, defaultData);
  return new Low(adapter, defaultData);
}

let db;

(async () => {
  db = await initDb();
  await db.read();
  db.data ||= { payments: [] };
  await db.write();
})();

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(__dirname));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

app.get('/api/payments', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  await db.read();
  res.json((db.data.payments || []).sort((a, b) => Number(b.id || 0) - Number(a.id || 0)));
});

app.get('/api/payments/:id', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  await db.read();
  const payment = (db.data.payments || []).find((item) => String(item.id) === String(req.params.id));
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

app.post('/api/payments', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  await db.read();
  const payment = req.body || {};
  const payments = db.data.payments || [];
  const nextId = payments.length ? Math.max(...payments.map((item) => Number(item.id || 0))) + 1 : 1;

  const newPayment = {
    id: nextId,
    userName: payment.userName || '',
    userEmail: payment.userEmail || '',
    amount: payment.amount || '',
    fileName: payment.fileName || '',
    fileType: payment.fileType || '',
    fileData: payment.fileData || '',
    fileSize: payment.fileSize || '',
    uploadTime: payment.uploadTime || '',
    status: payment.status || 'PENDING',
    uploadDate: payment.uploadDate || new Date().toISOString().split('T')[0],
    approvalTime: payment.approvalTime || '',
    approvedBy: payment.approvedBy || '',
    adminComment: payment.adminComment || '',
    rejectionTime: payment.rejectionTime || '',
    rejectionReason: payment.rejectionReason || '',
    rejectedBy: payment.rejectedBy || '',
    submittedAt: payment.submittedAt || new Date().toISOString(),
    source: payment.source || 'user-side'
  };

  payments.push(newPayment);
  db.data.payments = payments;
  await db.write();
  res.status(201).json(newPayment);
});

app.put('/api/payments/:id', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  await db.read();
  const payments = db.data.payments || [];
  const index = payments.findIndex((item) => String(item.id) === String(req.params.id));

  if (index === -1) return res.status(404).json({ error: 'Payment not found' });

  const updated = { ...payments[index], ...req.body, id: Number(req.params.id) };
  payments[index] = updated;
  db.data.payments = payments;
  await db.write();

  res.json(updated);
});

app.delete('/api/payments/:id', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  await db.read();
  const payments = (db.data.payments || []).filter((item) => String(item.id) !== String(req.params.id));
  db.data.payments = payments;
  await db.write();

  res.json({ ok: true, deletedId: Number(req.params.id) });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Coin Shield API running on http://0.0.0.0:${port}`);
});
