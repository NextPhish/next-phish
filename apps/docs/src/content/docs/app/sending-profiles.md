---
title: Sending profiles
description: Configure the provider used for campaign messages.
---

A **sending profile** tells NextPhish which mail service should send a campaign message and which sender the recipient will see. You can keep several profiles for different approved domains or providers.

[![New sending profile form showing sender identity and SMTP provider fields](/screenshots/smtp-profile-form.jpg)](/screenshots/smtp-profile-form.jpg)

_Choose the provider first to reveal its settings; SMTP asks for a host, port, and optional credentials._

## Create and test one

1. Open **Sending profiles → New profile**.
2. Give it a clear internal name, such as `Awareness pilot sender`. Enter the sender name and email address approved by your mail team. Add a reply-to address only if someone monitors it.
3. Choose the provider type. The form shows the settings required for that provider. For SMTP, ask your mail administrator for the host, port, security mode and credentials.
4. Save the profile. Open it and use **Send test email** with a mailbox your team controls. Check the sender details and the message in that mailbox before using the profile in a campaign.
5. If this is the usual profile for your organization, mark it as default so it is preselected where the app supports a default.

For local testing with the app and worker running on the host, the SMTP capture service uses `localhost`, port `1025`, secure mode off and no credentials. In production, use a real provider reachable from the worker container; `localhost` inside that container does not point to your mail server.

Campaign delivery uses the **selected profile**. Global `SMTP_*` environment settings send system messages such as account verification and do not update a saved profile. If the provider accepts the test but mail lands in quarantine, follow [Allowlist simulation mail](/guides/mail-allowlisting/) with your mail team. If no message leaves NextPhish, inspect the profile and its test-email error first.
