---
title: Profile and settings
description: Update your account, security settings and personal API keys.
---

Open **Profile** from the account menu. **General** settings include your name, timezone and interface language; your email address is read-only. **Security** lets you change your password and manage authenticator-based two-factor sign-in. Finish verification and retain backup codes when enabling two-factor authentication.

In **API keys**, create a personal access token with a name, organization limits, permissions, expiration and rate limit. Copy the secret when shown and store it securely; revoke keys you no longer use. The **Notifications** area is currently a placeholder.

For an assistant, create a separate key and follow [Connect an AI assistant with MCP](/guides/mcp/) to set up the `/api/mcp` endpoint.

Global **Settings** exposes ignored-network management to NextPhish administrators. These addresses apply to **every organization** in this installation. An organization's own **Settings → Event collection** list applies only to that workspace. Both lists are checked when a tracking event is processed. See [Ignore test and scanner IPs](/guides/ignored-networks/) for a step-by-step guide and examples.
