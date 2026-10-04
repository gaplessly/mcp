// Checks the hosted server against this README. Run: node --test
// ponytail: runs against the live endpoint (override with MCP_URL), so it needs
// network. It calls every declared tool with placeholder input and expects a
// clean tool-level error, because a real booking lookup needs a real venue.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const URL_ = process.env.MCP_URL ?? 'https://gaplessly.com/api/mcp'

async function rpc(method, params) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  assert.equal(res.status, 200, `${method} returned HTTP ${res.status}`)
  const text = await res.text()
  // Streamable HTTP may answer as plain JSON or as one SSE "data:" line.
  const body = text.startsWith('{') ? text : text.split('\n').find((l) => l.startsWith('data: '))?.slice(6)
  return JSON.parse(body)
}

const { result } = await rpc('tools/list')
const tools = result.tools

test('the README tool table matches what the server declares', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
  const documented = [...readme.matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]).sort()
  assert.deepEqual(tools.map((t) => t.name).sort(), documented)
})

test('every tool is read-only and has an input schema', () => {
  for (const t of tools) {
    assert.equal(t.annotations?.readOnlyHint, true, `${t.name} must declare readOnlyHint`)
    assert.equal(t.inputSchema?.type, 'object', `${t.name} must declare an input schema`)
  }
})

for (const t of tools) {
  test(`${t.name} answers placeholder input with a clean tool error`, async () => {
    const args = {}
    for (const key of t.inputSchema.required ?? []) {
      args[key] = t.inputSchema.properties[key].type === 'integer' ? 2 : 'zz-not-a-real-value'
    }
    const { result: out } = await rpc('tools/call', { name: t.name, arguments: args })
    assert.equal(out.isError, true, `${t.name} should reject an unknown venue or token`)
    assert.ok(out.content?.[0]?.text, `${t.name} should explain the error`)
  })
}
