'use strict';

const express = require('express');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';
const DEPLOYED_AT = new Date().toISOString();
const VERSION = process.env.APP_VERSION || '2.0.0';

// ── Prometheus 메트릭 ────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3],
  registers: [register],
});

// ── 미들웨어 ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const route = req.route?.path || req.path;
    const labels = [req.method, route, String(res.statusCode)];
    httpRequestsTotal.labels(...labels).inc();
    httpDuration.labels(...labels).observe((Date.now() - start) / 1000);
  });
  next();
});

// ── 워크샵 데이터 ────────────────────────────────────────────────────
const WORKSHOP_MODULES = [
  { id: 1, name: 'Governance & Landing Zone',     status: 'completed', layer: 'Platform / Governance' },
  { id: 2, name: 'Network Architecture (Hub-Spoke)', status: 'completed', layer: 'Network' },
  { id: 3, name: 'Security & Identity',           status: 'completed', layer: 'Identity' },
  { id: 4, name: 'Cloud Resiliency & HA',         status: 'completed', layer: 'Resiliency' },
  { id: 5, name: 'Azure Monitor & Telemetry',     status: 'completed', layer: 'Observability' },
  { id: 6, name: 'FinOps & Cost Governance',      status: 'completed', layer: 'FinOps' },
  { id: 7, name: 'Automation & Bicep IaC',        status: 'completed', layer: 'Automation' },
];

const LANDING_ZONE_LAYERS = [
  { layer: 'Platform',     resources: ['LTM-Corp MG', 'Korea Policy'],           module: 'Pre-work' },
  { layer: 'Governance',   resources: ['RBAC', 'Azure Policy', 'Resource Lock'],  module: 'Module 1' },
  { layer: 'Network',      resources: ['Hub VNet', 'Spoke VNet', 'NSG 3-tier'],   module: 'Module 2' },
  { layer: 'Identity',     resources: ['Managed Identity', 'Key Vault'],          module: 'Module 3' },
  { layer: 'Resiliency',   resources: ['AZ VM x2', 'Standard LB', 'Backup'],     module: 'Module 4' },
  { layer: 'Observability',resources: ['Log Analytics', 'KQL', 'Alert Rules'],    module: 'Module 5' },
  { layer: 'FinOps',       resources: ['Budget Alert', 'Tags', 'Advisor'],        module: 'Module 6' },
  { layer: 'Automation',   resources: ['Bicep', 'Automation Runbook', 'CI/CD'],   module: 'Module 7' },
];

// ── 라우트 ────────────────────────────────────────────────────────────

// 홈페이지 — Landing Zone 시각화
app.get('/', (req, res) => {
  const rows = LANDING_ZONE_LAYERS
    .map(l => `<tr>
      <td><strong>${l.layer}</strong></td>
      <td>${l.resources.join(', ')}</td>
      <td><span class="badge">${l.module}</span></td>
    </tr>`)
    .join('');

  const moduleCards = WORKSHOP_MODULES
    .map(m => `<div class="card">
      <span class="check">✅</span>
      <div>
        <strong>Module ${m.id}</strong><br/>
        <small>${m.name}</small><br/>
        <span class="tag">${m.layer}</span>
      </div>
    </div>`)
    .join('');

  res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>LTM Korea — Azure SA Workshop</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#0a0a1a;color:#e0e0e0;min-height:100vh}
    .hero{background:linear-gradient(135deg,#0078d4 0%,#005a9e 100%);padding:40px 24px;text-align:center}
    .hero h1{font-size:2rem;color:#fff;margin-bottom:8px}
    .hero p{color:#c8e6ff;font-size:1rem}
    .badge-row{display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap}
    .pill{background:rgba(255,255,255,.15);color:#fff;padding:4px 14px;border-radius:20px;font-size:.8rem}
    .pill.green{background:#107c10}
    .section{max-width:960px;margin:32px auto;padding:0 16px}
    h2{color:#0078d4;margin-bottom:16px;font-size:1.2rem;border-left:4px solid #0078d4;padding-left:10px}
    table{width:100%;border-collapse:collapse;background:#111827;border-radius:8px;overflow:hidden}
    th{background:#1e293b;color:#94a3b8;padding:10px 14px;text-align:left;font-size:.8rem;text-transform:uppercase}
    td{padding:10px 14px;border-bottom:1px solid #1e293b;font-size:.9rem}
    tr:last-child td{border:none}
    .badge{background:#0078d4;color:#fff;padding:2px 8px;border-radius:4px;font-size:.75rem}
    .modules{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
    .card{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:14px;display:flex;gap:12px;align-items:flex-start}
    .check{font-size:1.4rem;line-height:1}
    .tag{background:#134e4a;color:#5eead4;padding:2px 7px;border-radius:4px;font-size:.72rem}
    .endpoints{display:flex;flex-wrap:wrap;gap:8px}
    .ep{background:#1e293b;color:#38bdf8;padding:6px 14px;border-radius:6px;font-size:.85rem;text-decoration:none;border:1px solid #334155}
    .ep:hover{background:#0078d4;color:#fff}
    footer{text-align:center;padding:24px;color:#475569;font-size:.8rem}
  </style>
</head>
<body>
  <div class="hero">
    <h1>🏗️ LTM Korea — Azure SA Workshop</h1>
    <p>Hub-Spoke Landing Zone · 7 Modules · GitHub Actions CI/CD</p>
    <div class="badge-row">
      <span class="pill green">✅ All 7 Modules Completed</span>
      <span class="pill">v${VERSION}</span>
      <span class="pill">${ENV}</span>
      <span class="pill">Korea Central</span>
    </div>
  </div>

  <div class="section">
    <h2>🏛️ Landing Zone Architecture</h2>
    <table>
      <thead><tr><th>Layer</th><th>Azure Resources</th><th>Module</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>📦 Workshop Modules</h2>
    <div class="modules">${moduleCards}</div>
  </div>

  <div class="section">
    <h2>🔗 API Endpoints</h2>
    <div class="endpoints">
      <a class="ep" href="/health">/health</a>
      <a class="ep" href="/api/modules">/api/modules</a>
      <a class="ep" href="/api/landing-zone">/api/landing-zone</a>
      <a class="ep" href="/api/status">/api/status</a>
      <a class="ep" href="/metrics">/metrics</a>
    </div>
  </div>

  <footer>Deployed: ${DEPLOYED_AT} · VM: ltmsa-demo-vm (ltmsa-security-rg) · Region: Korea Central</footer>
</body>
</html>`);
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ltm-azure-sa-workshop',
    version: VERSION,
    environment: ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 워크샵 모듈 목록
app.get('/api/modules', (req, res) => {
  res.json({
    total: WORKSHOP_MODULES.length,
    completed: WORKSHOP_MODULES.filter(m => m.status === 'completed').length,
    modules: WORKSHOP_MODULES,
  });
});

// Landing Zone 레이어 정보
app.get('/api/landing-zone', (req, res) => {
  res.json({
    name: 'LTM Korea Azure Landing Zone',
    region: 'koreacentral',
    managementGroup: 'LTM-Corp',
    layers: LANDING_ZONE_LAYERS,
  });
});

// API 상태
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    service: 'ltm-azure-sa-workshop',
    version: VERSION,
    environment: ENV,
    deployedAt: DEPLOYED_AT,
    node: process.version,
  });
});

// Prometheus 메트릭
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// 서버 시작
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LTM Azure SA Workshop app running on port ${PORT}`);
    console.log(`   ENV: ${ENV} | Version: ${VERSION}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
