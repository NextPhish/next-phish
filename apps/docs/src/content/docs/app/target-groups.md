---
title: Target groups
description: Build and maintain a recipient audience.
---

A **target group** is the audience for a simulation. Keep an initial group small and use only addresses included in your organization's approved exercise.

[![New target group form with name, status, and Add user action](/screenshots/target-groups.jpg)](/screenshots/target-groups.jpg)

_Add recipients to the draft group, then review the final list before activating it._

## Make a small group

1. Open **Target groups → New group** and enter a name such as `Pilot team`.
2. Add each recipient's email, first name and last name. Position is optional and can be used for personalized content.
3. Save the group, then open its detail page. Review the recipient table and correct any address or name before using the group.
4. Choose **Active** when it is ready to select in a campaign. Check the final member count again immediately before scheduling.

For a larger audience, use **Import users** on the group's detail page. The dialog offers an insert mode and an update mode. Review the file, choose the intended mode, and wait for the progress and result summary. Imports need working storage and a running worker. A file upload finishing does not mean every row was accepted; review the reported result and the final recipient table.

When a campaign runs, NextPhish copies the relevant recipient details into that campaign's snapshot. Changing the group later will not rewrite the history of an already materialized run. See [Events and data](/concepts/events-and-data/) for the recipient information that is stored.
