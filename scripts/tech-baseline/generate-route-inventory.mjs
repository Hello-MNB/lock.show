import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const output = path.join(root, 'src', 'contracts', 'technical-baseline', 'route-api-inventory.json');
const routeFile = 'src/App.jsx';
const apiFile = 'server/index.js';

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');
const routeSource = read(routeFile);
const apiSource = read(apiFile);

const classifyRouteGuard = (element) => {
  if (element.includes('RequireAdmin')) return 'server-capability:admin.environment';
  const role = element.match(/RequireRole\s+role=\{ROLES\.([A-Z_]+)\}/);
  if (role) return `role:${role[1]}`;
  if (element.includes('RequireAuth')) return 'authenticated';
  if (element.includes('RequireAgency')) return 'agency-guard';
  if (element.includes('RequireProduction')) return 'production-guard';
  return 'public-or-unclassified';
};

const routes = [];
for (const [index, line] of routeSource.split(/\r?\n/).entries()) {
  const match = line.match(/<Route\s+path="([^"]+)"\s+element=\{(.+)\}\s*\/>/);
  if (!match) continue;
  const pathValue = match[1];
  const observedGuard = classifyRouteGuard(match[2]);
  const isAdmin = pathValue === '/admin';
  routes.push({
    path: pathValue,
    observedGuard,
    requiredCapability: isAdmin ? 'admin.environment' : 'OPEN_EVIDENCE',
    returnContract: 'OPEN_EVIDENCE',
    status: isAdmin && observedGuard !== 'server-capability:admin.environment' ? 'COLLISION' : 'INVENTORIED',
    source: { file: routeFile, line: index + 1 }
  });
}

const apis = [];
for (const [index, line] of apiSource.split(/\r?\n/).entries()) {
  const match = line.match(/app\.(get|post|put|patch|delete)\('([^']+)'\s*,(.*)$/);
  if (!match) continue;
  apis.push({
    method: match[1].toUpperCase(),
    path: match[2],
    observedAuth: match[3].includes('requireAuth') ? 'requireAuth' : 'public-or-inline',
    capability: match[2] === '/api/admin/capability' ? 'admin.environment:preflight' : 'OPEN_EVIDENCE',
    returnContract: 'OPEN_EVIDENCE',
    source: { file: apiFile, line: index + 1 }
  });
}

const inventory = {
  schemaVersion: '1.0.0',
  sourceHashes: { [routeFile]: hash(routeSource), [apiFile]: hash(apiSource) },
  routes,
  apis,
  releaseBlockers: routes.some((route) => route.path === '/admin' && route.status === 'COLLISION')
    ? ['TB08_ADMIN_ROUTE_GUARD_COLLISION']
    : []
};
const serialized = `${JSON.stringify(inventory, null, 2)}\n`;

if (process.argv.includes('--stdout')) {
  process.stdout.write(serialized);
} else if (process.argv.includes('--check')) {
  const current = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
  if (current !== serialized) {
    console.error('ROUTE_API_INVENTORY_DRIFT');
    process.exit(1);
  }
  console.log('ROUTE_API_INVENTORY_OK');
} else {
  fs.writeFileSync(output, serialized);
  console.log(path.relative(root, output));
}
