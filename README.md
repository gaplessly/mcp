<a href="https://gaplessly.com/docs/mcp"><img src="https://raw.githubusercontent.com/gaplessly/mcp/main/.github/assets/banner.png" alt="Gaplessly: booking connector for AI assistants" width="100%"></a>

<p align="center">
  <a href="https://registry.modelcontextprotocol.io/v0.1/servers?search=com.gaplessly/booking"><img alt="MCP Registry: com.gaplessly/booking" src="https://img.shields.io/badge/MCP%20Registry-com.gaplessly%2Fbooking-0d647f?style=flat-square"></a>
  <img alt="Streamable HTTP" src="https://img.shields.io/badge/transport-streamable%20HTTP-0d647f?style=flat-square">
  <img alt="No authentication" src="https://img.shields.io/badge/auth-none-0d647f?style=flat-square">
  <img alt="Read-only" src="https://img.shields.io/badge/tools-read--only-0d647f?style=flat-square">
  <a href="https://m8ven.ai/mcp/gaplessly/mcp?s=readme"><img alt="M8ven Score" src="https://m8ven.ai/badge/mcp/gaplessly/mcp"></a>
</p>

An AI assistant connected to this server can find free appointment and table times at any business that takes bookings through [Gaplessly](https://gaplessly.com), and hand the guest a link to finish the booking themselves. It is one public endpoint for the whole platform, read-only, with no API key.

```
https://gaplessly.com/api/mcp
```

Streamable HTTP, JSON-RPC 2.0, stateless. Listed in the official MCP Registry as `com.gaplessly/booking`. This repository documents the hosted server; there is nothing to install or run.

## Connect

**Claude Code**

```bash
claude mcp add --transport http gaplessly https://gaplessly.com/api/mcp
```

**Claude** (web and desktop): Customize, Connectors, then the **+** button. Name it Gaplessly, paste `https://gaplessly.com/api/mcp`, and click Add.

**Cursor**, in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "gaplessly": { "url": "https://gaplessly.com/api/mcp" }
  }
}
```

**VS Code**, in `.vscode/mcp.json`:

```json
{
  "servers": {
    "gaplessly": { "type": "http", "url": "https://gaplessly.com/api/mcp" }
  }
}
```

Any other client that speaks streamable HTTP takes the same URL.

## Tools

| Tool | What it does |
|---|---|
| `get_venue` | A venue's public booking profile: what it is, where, what can be booked, and the venue's own current time. Call this first. |
| `find_appointment_times` | Free times at one venue for one service, over up to two weeks. For salons, clinics and studios. |
| `find_table_times` | Free times at one restaurant or venue for one party size, over up to two weeks. |
| `book_appointment` | Turns a chosen appointment time into a link the guest opens to finish booking. |
| `book_table` | Turns a chosen table time into a link the guest opens to finish booking. |

Every tool is read-only, including the two named `book_`: they return a link and write nothing. Ask the server itself for the authoritative definitions:

```bash
curl -s https://gaplessly.com/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Why nothing here books

An assistant cannot prove who it is speaking for, so a connector that booked outright would be booking for whoever the model says, on details the model typed. The last step is a link on the venue's own booking page, where the guest enters their own name, email and phone, and where deposits and a venue's own questions are asked. No tool accepts a guest's personal details.

## Times

No tool returns a timezone, on purpose. A model that sees a zone beside a time converts it, and books hours wrong. Times come back as display text for the guest plus an opaque signed token. A token expires in about thirty minutes and cannot be edited, reused for another venue, or pointed at a different service or party size, which is what stops a prompt injection redirecting a booking.

## More

- [Full documentation](https://gaplessly.com/docs/mcp)
- [Connector terms](https://gaplessly.com/legal/ai-connector)
- [Privacy policy](https://gaplessly.com/legal/privacy)
- [Gaplessly API reference](https://gaplessly.com/docs) and the [CLI](https://github.com/gaplessly/cli), for reading your own business's data with an API key
- Questions: [hello@gaplessly.com](mailto:hello@gaplessly.com)

## License

[MIT](LICENSE). The Gaplessly name and logo are not covered by it.
