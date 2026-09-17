---
title: Ignore test and scanner IPs
description: Keep security scanners and test devices from inflating campaign interaction results.
---

Mail security products sometimes open images and follow links before a person sees the message. NextPhish can **ignore interaction events from specific IP addresses or networks** so those automated requests do not inflate open, click, or submit results.

This list changes **measurement**, not message delivery. It does not allow an email through a mail gateway and it does not block anyone from opening a campaign page. For mail delivery rules, see [Allowlist simulation mail](/guides/mail-allowlisting/).

[![Organization Event collection settings showing the ignored IP or CIDR network form](/screenshots/ignored-networks.jpg)](/screenshots/ignored-networks.jpg)

_In an organization, open the Event collection tab to add an IP address or CIDR range. The example workspace has no ignored networks yet._

## Choose the scope

| Where you add the address                      | Effect                                                 | Who can manage it                                         |
| ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| **Organization → Settings → Event collection** | Applies to campaigns in that organization.             | A member with permission to change organization settings. |
| **Global Settings → Ignored networks**         | Applies across all organizations in this installation. | A NextPhish administrator.                                |

Both scopes are checked when an interaction is processed. An organization list is useful for its own office or scanner; the global list is useful for shared infrastructure. Organization changes are also recorded in an audit history.

## Add an address

1. Find the **public IP address** that NextPhish sees for the scanner or test device. Ask your network or mail administrator if the device uses a shared gateway, VPN, or proxy. Do not guess from a private address such as `192.168.x.x` when requests reach NextPhish through a public proxy.
2. Open the correct settings page from the table above.
3. In **IP address or network**, enter a single address such as `192.0.2.10` or a CIDR range such as `192.0.2.0/24`. IPv4 and IPv6 are supported. The examples here are documentation addresses; replace them with addresses you actually control.
4. Add a description such as `Mail scanner egress` so another administrator knows why it is there, then select **Add ignored network**.
5. Review the saved list. For an organization entry, you can later inspect its audit history or remove it after the test.

Use the narrowest range that covers the actual source. A broad range can hide real recipient activity.

## Check the result

Run a small campaign with authorized test recipients. Open or click the message once from the ignored network, then once from a different network. The ignored request should not create an **Opened**, **Clicked**, or **Submitted** campaign event. A **Reported** event is still recorded even from an ignored IP. Existing events are not retroactively removed when you add a network.

If scanner activity still appears, check the real client IP seen by the content server. When NextPhish is behind a reverse proxy, `TRUSTED_PROXY_NETWORKS` identifies **which proxy addresses may supply forwarded client IP information**. It is a server deployment setting, separate from the ignored-network list. If it is wrong, NextPhish may see the proxy's IP instead of the visitor's. Ask the deployment administrator to verify the proxy chain; only add addresses you actually trust as proxies.

See [Events and data](/concepts/events-and-data/) for event meanings and what is stored.
