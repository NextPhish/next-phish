---
title: Pages
description: Create recipient-facing landing and redirect pages.
---

A **page** is what a recipient sees after following a campaign link. A **Landing** page shows practice content; a **Redirect** page sends the visitor to another approved destination.

[![New page form with the visual editor, page type, public path, status, and redirect setting](/screenshots/page-editor.jpg)](/screenshots/page-editor.jpg)

_The page editor has the visual canvas on the left and publishing options on the right._

## Create a landing page

1. Open **Pages → New page** and choose **Landing**. Give the page an internal name, optional path, and **Draft** status while you build it.
2. Use the visual editor to prepare the practice page. You can import an approved website URL as a starting point, then inspect every image, script, link, and form in the imported result.
3. Preview the page. Check that it works on a small screen as well as a desktop browser, and that it does not ask for real secrets.
4. Make the page **Active** when ready, then select it in a campaign.

For a redirect page, choose no target, another active redirect page, or an external URL in page settings. Confirm that any external destination is one your organization controls or has approved. The page type cannot be changed after creation.

Recipient pages are served by the separate content server through `PUBLIC_CONTENT_URL`. In production, keep that origin separate from the authenticated management app. The current tracking handler records a **Submitted** event when the page's submit action is used; it does not parse or retain the entered field values. Design practice pages so they do not request real passwords or other sensitive information. See [Events and data](/concepts/events-and-data/) for the full explanation.

If an import or preview fails, ask the deployment administrator to check R2 storage and the worker. If the page opens but no event appears, check the campaign's public content URL and the [event guide](/concepts/events-and-data/).
