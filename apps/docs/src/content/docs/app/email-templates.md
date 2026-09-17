---
title: Email templates
description: Compose the message recipients will receive.
---

An **email template** is the practice message people receive. It defines the subject and body, while the [sending profile](/app/sending-profiles/) defines who sends it.

[![New email template fields with tracking pixel option and placeholder variables](/screenshots/email-template-editor.jpg)](/screenshots/email-template-editor.jpg)

_The form sets the template name, status, and tracking option. The variable panel provides placeholders for recipient details and the campaign link; the visual editor is immediately below the form._

## Prepare the message

1. Open **Email templates → New template**. Give it an internal name that describes the exercise, not just `Test`.
2. Set its status to **Draft** while working. Add tags if your team uses them to organize templates.
3. Build the subject and body in the visual editor. The variable panel shows placeholders that NextPhish can replace with recipient or campaign information. Preview a sample so you can spot missing text or layout problems.
4. Add attachments only if the exercise requires them. Wait until an upload or removal finishes before saving; these operations depend on the configured R2 storage.
5. Save and preview the message, then send a test through the chosen sending profile to a mailbox your team controls. Check it on both desktop and mobile mail clients if those are in your audience.
6. Mark the template **Active** when it is ready to choose in a campaign.

Before a wider send, make sure the visible sender, links, and content match the approved exercise. Campaigns reference the saved template, so review changes before reusing it in another run. If messages do not arrive, see [Sending profiles](/app/sending-profiles/) and [Mail allowlisting](/guides/mail-allowlisting/).
