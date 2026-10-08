import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateMemoHtml } from './memo-html.mjs';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'memos.json');
const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));
const view = (m) => { const d = m.data || {}, p = d.programInfo || {}, x = d.pendapatan || {}; return { id: m.id, nomorMemo: m.nomorMemo, tanggalSubmit: m.tanggalSubmit, supplierNama: d.identity?.supplier?.name || '', supplierId: d.identity?.supplier?.id || '', picName: d.identity?.picName || '', outlets: d.outlets || [], jenisMemo: d.jenisMemo, status: m.status, ringkasan: m.ringkasan, detail: m.detail || [], data: d, periodeAwal: p.periodeAwal || x.sewaPeriodeAwal || x.promosiPeriodeAwal || x.eventPeriodeAwal || x.rewardPeriodeAwal || '', periodeAkhir: p.periodeAkhir || x.sewaPeriodeAkhir || x.promosiPeriodeAkhir || x.eventPeriodeAkhir || x.rewardPeriodeAkhir || x.listingPeriodeAkhir || '' }; };

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const url = new URL(req.url || '/', 'http://localhost');
  if (!url.pathname.startsWith('/api/memo')) { res.statusCode = 404; return res.end(JSON.stringify({ message: 'Not found' })); }
  const rows = read(); const id = url.pathname.split('/')[3]; const raw = id ? rows.find((item) => item.id === id) : null;
  if (id && url.pathname.endsWith('/pdf')) { if (!raw) { res.statusCode = 404; return res.end('Not found'); } res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Content-Disposition', `inline; filename="${raw.nomorMemo}.html"`); return res.end(generateMemoHtml(view(raw))); }
  let out = rows.map(view).filter((m) => (!url.searchParams.get('jenis') || m.jenisMemo === url.searchParams.get('jenis')) && (!url.searchParams.get('dari') || m.tanggalSubmit >= url.searchParams.get('dari')) && (!url.searchParams.get('sampai') || m.tanggalSubmit <= url.searchParams.get('sampai')) && (!url.searchParams.get('search') || JSON.stringify(m).toLowerCase().includes(url.searchParams.get('search').toLowerCase())));
  if (id) out = out.filter((m) => m.id === id); res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(id ? out[0] || {} : out));
}).listen(3001, () => console.log('Memo API listening on 3001'));
