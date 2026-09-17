---
title: Connect an AI assistant with MCP
description: Give an AI assistant controlled access to NextPhish tools and data.
---

NextPhish includes an **MCP server**. MCP (Model Context Protocol) lets a compatible AI assistant discover and call tools in your NextPhish installation. You can ask the assistant to inspect resources, prepare an email template or landing page, create a follow-up task, and report what it changed. The same permissions and organization access that protect the web app apply to the API key used by the assistant.

This is useful when you manage many simulation assets. For example, you could ask: “List the draft email templates in our workspace, then create a high-priority task to review the one named Welcome reminder.” The assistant can use the available tools instead of asking you to copy each item into a chat.

## What an assistant can do

The current server registers **34 tools**. Your connected assistant discovers the exact tools and inputs from the server's `tools/list` response.

| Area             | Available work                                                               |
| ---------------- | ---------------------------------------------------------------------------- |
| Organizations    | List, inspect, create, or delete an organization.                            |
| Email templates  | List, inspect, create, update, or delete templates.                          |
| Pages            | List, inspect, create, update, delete, or import a page from a URL.          |
| Sending profiles | List, inspect, create, update, or delete profiles.                           |
| Target groups    | Create a group.                                                              |
| Tasks            | List, inspect, create, update, move, or delete tasks; manage board statuses. |
| Files and jobs   | List files and check the status of a background job.                         |

There is **no MCP tool to create or run a campaign** in this version. Build and publish the campaign in the web app after reviewing the assets and target group. MCP also does not upload files, test a sending profile, or manage organization members. A permission checkbox in the API key form does not mean there is a matching MCP tool. The live `tools/list` response is the reliable inventory for your installation.

## Before you connect

You need a running NextPhish installation, an account allowed to create API keys, and an MCP-compatible client that supports a remote HTTP server and a custom request header. The client must be able to reach the NextPhish **management app**. For a production installation, use its HTTPS address. If the client runs on another machine, `localhost` points to that machine, not your NextPhish server.

The endpoint is the app's address followed by `/api/mcp`:

| App address                     | MCP endpoint                            |
| ------------------------------- | --------------------------------------- |
| `https://nextphish.example.com` | `https://nextphish.example.com/api/mcp` |
| `http://localhost:3000`         | `http://localhost:3000/api/mcp`         |

Your NextPhish deployment also needs its normal database and Redis services running. The MCP handler uses Redis for its connection state.

## 1. Create a separate API key

In the web app, open the **account menu → Account settings → API Keys → Create API key**. Give the key a name that identifies the client, such as `Research assistant`. Use a separate key for each client so you can revoke one without interrupting another.

[![Create API key dialog showing organization limits and read and write permissions](/screenshots/mcp-api-key-form.jpg)](/screenshots/mcp-api-key-form.jpg)

_Choose the organizations and permissions the assistant actually needs. This example form contains no real secret._

1. Turn on **Limit to specific organizations** and select the workspaces the assistant should access.
2. In **Permissions**, enable **Read** for resources it needs to inspect. Enable **Write** only for resources it should change. For the example above, it needs read access to organizations, email templates, and tasks, plus write access to tasks.
3. Choose an **Expiration** and keep **Rate limiting** enabled. Review the settings, then select **Create API key**.
4. Copy the secret when it appears. The app shows it only once. Store it in your client's secret storage or another protected location. Never put a real key in a screenshot, document, or repository.

The key acts with your account's access. It cannot bypass organization membership, and the backend still checks permissions for each operation. You can revoke the key later from the **API Keys** tab.

## 2. Add the server to your AI client

In the client's MCP settings, add a **remote HTTP** server with these values:

| Setting              | Value                             |
| -------------------- | --------------------------------- |
| Server URL           | Your `https://…/api/mcp` endpoint |
| Request header name  | `x-api-key`                       |
| Request header value | The API key you just copied       |

Some clients use a JSON configuration like this. The exact field names and setup screen depend on the client:

```json
{
  "mcpServers": {
    "nextphish": {
      "url": "https://nextphish.example.com/api/mcp",
      "headers": {
        "x-api-key": "YOUR_API_KEY"
      }
    }
  }
}
```

Save the configuration and reconnect the client if it does not refresh its tool list automatically. Treat the example key as a placeholder; use the client's secure secret field when one is available.

## 3. Test with a read-only request

Start with: “List the organizations I can access in NextPhish.” If the client finds the `list_organizations` tool and returns your workspaces, the connection is working. Then try a workspace-specific request such as “List the open tasks in the NextPhish organization.” Most tools need an `organizationId`; your assistant can get it from the organization list rather than guessing it.

For a change, ask for a narrow action and check the result in the web app:

> Create a task called “Review the welcome email on mobile” in our workspace, with a high priority. Show me the task you created.

Review an assistant's proposed writes and its results just as you would review a teammate's work. In particular, inspect email content, landing pages, sender settings, and audience lists before using them in a live simulation.

## Tool inventory

The current tool names are:

| Area             | Tools                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Organizations    | `list_organizations`, `get_organization`, `create_organization`, `delete_organization`                                       |
| Email templates  | `list_email_templates`, `get_email_template`, `create_email_template`, `update_email_template`, `delete_email_template`      |
| Pages            | `list_pages`, `get_page`, `create_page`, `update_page`, `delete_page`, `import_page_from_url`                                |
| Sending profiles | `list_sending_profiles`, `get_sending_profile`, `create_sending_profile`, `update_sending_profile`, `delete_sending_profile` |
| Target groups    | `create_target_group`                                                                                                        |
| Tasks            | `list_tasks`, `get_task`, `create_task`, `update_task`, `move_task`, `delete_task`                                           |
| Task statuses    | `list_task_statuses`, `create_task_status`, `update_task_status`, `reorder_task_statuses`, `delete_task_status`              |
| Files and jobs   | `list_files`, `get_job_status`                                                                                               |

IDs are opaque strings. Let the assistant list resources and use returned IDs. For exact inputs and tool descriptions, inspect the tools your own server advertises; the installed version may differ from this guide.

## If the connection fails

- **“Missing API key” or “Invalid API key”:** Check that the client sends the complete key in the `x-api-key` header and that the key has not expired or been revoked.
- **No tools appear:** Check the `/api/mcp` URL, the client's connection log, and whether it supports a remote HTTP server with custom headers. Reconnect the client after changing its configuration.
- **A tool is visible but access is denied:** Check the key's read or write permissions and organization limit, plus your own membership in that organization.
- **A request fails after connecting:** Check the app and Redis services, then try a simple read request. If an import started a background job, use `get_job_status` with the returned job ID.

To stop access, revoke that client's key in **Account settings → API Keys**. The client will need a new key before it can call NextPhish again.
