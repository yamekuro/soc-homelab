#!/usr/bin/env node
'use strict';

// Controller regression checks only. These doubles do not implement a DOM,
// CSS, layout, accessibility tree, printing engine or real browser events.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'firewall-policy-map.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'Test the actual, single page controller');

function attributes(text) {
  return Object.fromEntries([...text.matchAll(/([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'))?/g)]
    .map((m) => [m[1], m[2] ?? m[3] ?? '']));
}
class ElementDouble {
  constructor(attrs = {}, changed = () => {}) {
    this.attrs = {...attrs};
    this.dataset = {};
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
    const classes = new Set((attrs.class || '').split(/\s+/).filter(Boolean));
    this.classList = {
      contains: (name) => classes.has(name),
      remove: (name) => classes.delete(name),
      toggle(name, force) {
        const enabled = force === undefined ? !classes.has(name) : force;
        if (enabled) classes.add(name); else classes.delete(name);
        return enabled;
      }
    };
    this.listeners = new Map();
    this.value = '';
    this.textContent = '';
    this.open = Object.hasOwn(attrs, 'open');
    this._html = '';
    this.changed = changed;
    // Arbitrary geometry exercises the wire controller, not any layout claim.
    this.clientWidth = 1000;
  }
  set innerHTML(value) { this._html = value; this.changed(value); }
  get innerHTML() { return this._html; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  dispatch(type) { for (const listener of this.listeners.get(type) || []) listener({target: this}); }
  replaceChildren() { this.innerHTML = ''; }
  getBoundingClientRect() { return {left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100}; }
}

const elements = new Map([...html.matchAll(/<[\w-]+\b([^>]*\bid="([^"]+)"[^>]*)>/g)]
  .map((m) => [m[2], new ElementDouble(attributes(m[1]))]));
let zoneButtons = [], ruleButtons = [], rows = [];
const destinations = [...html.matchAll(/<div\b([^>]*\bdata-target="[^"]+"[^>]*)>/g)]
  .map((m) => new ElementDouble(attributes(m[1])));
const details = [...html.matchAll(/<details\b([^>]*)>/g)]
  .map((m) => new ElementDouble(attributes(m[1])));
function get(id) { assert.ok(elements.has(id), 'Real markup must contain #' + id); return elements.get(id); }
get('zone-buttons').changed = (markup) => {
  zoneButtons = [...markup.matchAll(/<button\b([^>]*)>/g)].map((m) => new ElementDouble(attributes(m[1])));
};
get('rule-rows').changed = (markup) => {
  // Replacing innerHTML must discard the old rows and buttons: a stale fixture
  // would conceal exactly the previous-selection regression tested below.
  rows = [...markup.matchAll(/<tr\b([^>]*)>/g)].map((m) => new ElementDouble(attributes(m[1])));
  ruleButtons = [...markup.matchAll(/<button\b([^>]*)>/g)].map((m) => new ElementDouble(attributes(m[1])));
};
get('case-select').changed = (markup) => {
  const values = [...markup.matchAll(/<option\b[^>]*value="([^"]+)"/g)].map((m) => m[1]);
  if (!values.includes(get('case-select').value)) get('case-select').value = values[0] || '';
};
const root = get('fw-policy');
root.querySelector = (selector) => {
  assert.match(selector, /^#[\w-]+$/, 'Unsupported selector in the deliberately small double');
  return get(selector.slice(1));
};
root.querySelectorAll = (selector) => {
  const known = {'.zone': zoneButtons, '.dest': destinations, '#rule-rows tr': rows, '.rule-button': ruleButtons, details};
  assert.ok(Object.hasOwn(known, selector), 'Unsupported query: ' + selector);
  return known[selector];
};
const windowDouble = new ElementDouble();
const frames = [];
function flushFrames() {
  let count = 0;
  while (frames.length) {
    assert.ok(++count < 100, 'Animation callbacks must settle');
    frames.shift()();
  }
}
vm.runInNewContext(scripts[0][1], {
  document: {getElementById: (id) => get(id)},
  window: windowDouble,
  requestAnimationFrame: (callback) => frames.push(callback),
  ResizeObserver: class { observe() {} }
}, {filename: 'firewall-policy-map.html:inline-script', timeout: 2000});
flushFrames();
windowDouble.dispatch('load');
flushFrames();
const api = windowDouble.FirewallPolicy;

// Expected decisions come from the observed policy, not from reusing matches().
const decisions = {
  dns: ['users', 'DNS', 'R05 DNS', 'pass', ''],
  ntp: ['servers', 'NTP', 'R05 NTP', 'pass', ''],
  gui: ['mgmt', 'R03', 'R03', 'pass', ''],
  'mgmt-dns': ['mgmt', 'DNS', 'R05 DNS', 'pass', ''],
  'mgmt-ntp': ['mgmt', 'NTP', 'R05 NTP', 'pass', ''],
  'users-web': ['users', 'R08', 'R08', 'pass', 'web'],
  'dmz-web': ['dmz', 'R09', 'R09', 'block', 'web'],
  'dmz-wazuh': ['dmz', 'R06', 'R06', 'pass', 'wazuh'],
  'bastion-wazuh': ['mgmt', 'R06', 'R06', 'pass', 'wazuh'],
  resolver: ['users', 'R13a', 'R13a', 'block', 'internet'],
  home: ['servers', 'R01', 'R01', 'block', 'home'],
  quic: ['servers', 'R15', 'R15', 'block', 'internet'],
  'web-public': ['soc', 'R13', 'R13', 'pass', 'internet']
};
const special = {
  canary: ['dns', '127.0.0.1', ''],
  'dns-google': ['dns', '127.0.0.1', ''],
  'dns-quad9': ['dns', '127.0.0.1', ''],
  syslog: ['syslog', 'Local source', 'wazuh'],
  'same-zone': ['same', 'Outside the path', '']
};
const rowCounts = {mgmt: 8, users: 7, servers: 6, dmz: 7, soc: 5};
const findCase = (id) => { const c = api.cases.find((entry) => entry.id === id); assert.ok(c, id); return c; };
const pressed = (nodes) => nodes.filter((node) => node.getAttribute('aria-pressed') === 'true');
function selectCase(id) {
  get('case-select').value = id;
  get('case-select').dispatch('change');
  flushFrames();
}
function checkView(id) {
  const c = findCase(id);
  assert.equal(get('case-context').textContent, c.route, id + ': visible route');
  const expectedTarget = decisions[id]?.[4] ?? special[id][2];
  assert.equal(root.dataset.activeTarget, expectedTarget, id + ': destination context');
  assert.deepEqual(destinations.filter((el) => el.classList.contains('is-target')).map((el) => el.dataset.target),
    expectedTarget ? [expectedTarget] : [], id + ': no stale destination highlight');
  if (special[id]) {
    const [context, ip] = special[id];
    const view = api.caseView(c);
    assert.equal(view.zoneId, null, id + ': no client zone');
    assert.equal(view.ruleKey, null, id + ': no interface-rule attribution');
    assert.equal(root.dataset.context, context);
    assert.equal(pressed(zoneButtons).length, 0, id + ': clear prior zone');
    assert.equal(ruleButtons.length, 0, id + ': discard prior rule buttons');
    assert.equal(rows.filter((el) => el.classList.contains('is-selected')).length, 0);
    assert.equal(get('global-rule').classList.contains('is-selected'), false);
    assert.equal(get('wires').innerHTML, '', id + ': no invented routed wires');
    assert.equal(get('fw-selected-ip').textContent, ip);
    assert.match(get('rule-detail').innerHTML, /No client interface rule/);
    return;
  }
  const [zone, key, rule, action] = decisions[id];
  const result = api.evaluate(c);
  assert.equal(result.rule, rule, id + ': deciding rule');
  assert.equal(result.action, action, id + ': configured action');
  assert.equal(root.dataset.context, 'zone');
  assert.deepEqual(pressed(zoneButtons).map((el) => el.dataset.zone), [zone]);
  assert.equal(rows.length, rowCounts[zone], id + ': correct interface rows');
  assert.match(get('wires').innerHTML, /<path/, id + ': zone topology restored');
  const activeWires = [...get('wires').innerHTML.matchAll(/class="active"/g)].length;
  assert.equal(activeWires, 1 + Number(Boolean(expectedTarget)), id + ': no stale wire selection');
  assert.match(get('case-result').innerHTML, new RegExp((action === 'pass' ? 'Allow' : 'Block') + ' · ' + rule));
  if (key === 'R01') {
    assert.equal(get('global-rule').classList.contains('is-selected'), true);
    assert.equal(pressed(ruleButtons).length, 0, 'R01 is not an interface row');
    assert.equal(rows.filter((el) => el.classList.contains('is-selected')).length, 0);
    assert.match(get('rule-detail').innerHTML, /R01[\s\S]*Floating block/);
  } else {
    assert.equal(get('global-rule').classList.contains('is-selected'), false);
    assert.deepEqual(pressed(ruleButtons).map((el) => el.dataset.rule), [key]);
    assert.deepEqual(rows.filter((el) => el.classList.contains('is-selected')).map((el) => el.dataset.key), [key]);
  }
}

assert.equal(api.cases.length, 18);
assert.equal(new Set(api.cases.map((c) => c.id)).size, 18);
assert.equal(Object.values(api.orders).reduce((sum, order) => sum + order.length, 1), 34);
assert.equal(api.documentedManualCount, 34);
const domains = [...get('doh-domains').innerHTML.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => m[1]);
assert.equal(domains.length, 15);
assert.equal(new Set(domains).size, 15);
assert.ok(domains.includes('dns.google') && domains.includes('dns10.quad9.net'));

selectCase('dmz-wazuh'); checkView('dmz-wazuh');
selectCase('home'); checkView('home'); // R06 must not leak into R01's panel.
for (const id of Object.keys(special)) {
  selectCase('dmz-wazuh'); checkView('dmz-wazuh');
  selectCase(id); checkView(id);
  selectCase('users-web'); checkView('users-web');
}
for (const from of api.cases) {
  for (const to of api.cases) {
    selectCase(from.id); checkView(from.id);
    selectCase(to.id); checkView(to.id);
  }
}
// A zone button must also synchronize the case/result rather than keep a
// verdict that belongs to the previously selected zone.
for (const [zone, id] of Object.entries({mgmt: 'gui', users: 'dns', servers: 'ntp', dmz: 'dmz-web', soc: 'web-public'})) {
  selectCase('canary');
  zoneButtons.find((el) => el.dataset.zone === zone).dispatch('click');
  flushFrames();
  assert.equal(get('case-select').value, id);
  checkView(id);
}

assert.ok(details.length > 0);
details.forEach((el, index) => { el.open = index % 2 === 0; });
const initialOpen = details.map((el) => el.open);
for (let cycle = 0; cycle < 2; cycle++) {
  windowDouble.dispatch('beforeprint');
  assert.ok(details.every((el) => el.open), 'Print opens otherwise omitted disclosures');
  windowDouble.dispatch('beforeprint'); // Preserve the first snapshot.
  windowDouble.dispatch('afterprint');
  assert.deepEqual(details.map((el) => el.open), initialOpen, 'Print restores reader disclosure state');
  windowDouble.dispatch('afterprint'); // A duplicate notification is harmless.
}
const printCss = html.match(/@media print\{([\s\S]*?)<\/style>/)?.[1];
assert.ok(printCss, 'Explicit print rules exist');
const hidden = [...printCss.matchAll(/([^{}]+)\{[^{}]*display\s*:\s*none[^{}]*\}/g)]
  .flatMap((m) => m[1].split(',').map((selector) => selector.trim()));
for (const selector of ['.case-control', '.cases', '.case-context', '#case-context']) {
  assert.ok(!hidden.includes(selector), 'Print must preserve the route, not hide ' + selector);
}
assert.ok(hidden.includes('.case-control select') && hidden.includes('.case-control label'));
assert.match(html, /<p class="case-context" id="case-context">/);
assert.match(printCss, /color-scheme\s*:\s*light/);
assert.match(printCss, /--ink\s*:/);

console.log('PASS: 13 policy decisions; 34 manual rules; 15 domains; R06/R01, five standalone round trips, 324 case pairs, zone controls and print state.');
console.log('Scope: controller test doubles, not a browser or DOM/layout check. No network or lab traffic was generated.');
