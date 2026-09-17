---
title: Organizations
description: Manage workspaces, members and event collection settings.
---

An **organization** is a workspace for one team or company. Its campaigns, target groups, templates, and results are kept together. Use the organization switcher in the app navigation to choose which workspace you are viewing.

Open **Organizations** to see the workspaces you can access. Select one to review its members and analytics. If you have permission, you can create a workspace, invite or manage members, and change its name and URL slug in its **Settings** area.

## Keep scanner activity out of results

Within an organization's detail page, open **Settings → Event collection** to manage **Ignored networks**. Enter an IP address or CIDR range and a short description. NextPhish will still serve the simulation page from that address, but **Opened**, **Clicked**, and **Submitted** interactions from it will not count in campaign results. **Reported** events are still recorded. This helps when a mail scanner or shared test machine would otherwise make engagement look higher than it is.

Read [Ignore test and scanner IPs](/guides/ignored-networks/) before adding a range. Adding a range does not remove events already recorded, and it does not allow mail through your organization's gateway.

## Members and permissions

Choose a person's role based on what they need to do. Some settings and destructive actions are restricted; if an action is unavailable, ask a workspace owner or administrator rather than changing permissions broadly. An organization cannot always be deleted while it is the owner's only workspace.

Initial onboarding creates the first organization after administrator setup. See [Local development](/guides/local-development/) or [Production deployment](/guides/production/) for bootstrap steps.
