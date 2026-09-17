---
title: Allowlist simulation mail
description: Prepare your mail environment so authorized test messages reach the intended inboxes.
---

NextPhish sends campaign messages through the **sending profile** chosen in the campaign. Your organization's mail gateway can still quarantine or rewrite those messages. Ask the mail administrator to set up a **narrow, documented exception for the simulation** before a wider run.

The **sending IP** is usually the outbound IP of the SMTP or email provider in the sending profile. It is not necessarily the IP of the NextPhish web app or the public landing-page server. Verify the actual sender details in a delivered test message's headers or with your provider.

## Before a campaign

1. Agree on the test audience, campaign dates, sender domain, and public content domain with your security and mail teams.
2. Configure a [sending profile](/app/sending-profiles/) for the approved provider and send a test message to a mailbox your team controls.
3. From that message and provider configuration, record the **outbound sending IP**, the **envelope MAIL FROM domain**, the visible From address, and the **DKIM signing domain**. Confirm SPF, DKIM, and DMARC are configured for the domain you own.
4. Give those exact values to your mail administrator. Request a rule limited to this simulation's sender and audience, and set an end date for removing it. Test that ordinary mail is still handled normally.
5. Run a small pilot. Check the provider's accepted or rejected status, the recipient inbox or quarantine, and the campaign timeline before increasing the audience.

For **Microsoft 365**, the provider's [Advanced delivery policy for non-Microsoft phishing simulations](https://learn.microsoft.com/en-us/defender-office-365/advanced-delivery-policy-configure) is the relevant feature. Microsoft's current instructions require at least one domain and one sending IP for an email simulation. Follow that guide for your tenant and mail routing rather than creating a broad organization-wide spam bypass.

For another mail platform, follow its administrator documentation and use the same verified sender details. The exact policy name and available controls vary by provider. NextPhish itself does not have a mail-gateway IP allowlist screen.

## Three different IP settings

| Setting                                | Where it lives                            | What it does                                                                             |
| -------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Mail allowlist / simulation policy** | Your mail gateway                         | Helps approved test mail reach the intended inboxes.                                     |
| **Ignored networks**                   | NextPhish organization or global Settings | Excludes opens, clicks, and submits from selected source IPs from campaign results.      |
| **Trusted proxy networks**             | NextPhish server configuration            | Tells the public content server which reverse proxies may supply a forwarded visitor IP. |

These settings solve different problems. If a message never arrives, investigate the sender, provider, and mail policy. If a scanner inflates results, use [Ignored networks](/guides/ignored-networks/). If every visitor appears to come from the proxy, check the [production proxy configuration](/guides/production/).
