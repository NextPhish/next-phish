export const emailStarterContent = `
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Account activity review</title></head>
<body style="margin:0;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#192235;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:24px 12px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e8ef;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:20px 28px;background:#151b2c;color:#ffffff;font-size:20px;font-weight:700;">Account services</td></tr>
      <tr><td style="padding:36px 28px;">
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello {{.FirstName}},</p>
        <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#192235;">Review recent account activity</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5565;">A recent sign-in needs your review. Use the secure account portal below to check the activity associated with {{.Email}}.</p>
        <p style="margin:28px 0;"><a href="{{.URL}}" style="display:inline-block;background:#5146d9;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:7px;font-size:15px;font-weight:700;">Review account activity</a></p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#626d80;">If you were not expecting this message, contact your support team using a trusted channel.</p>
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #e5e8ef;font-size:12px;line-height:1.6;color:#626d80;">Automated account notification · Please do not reply</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

export const pageStarterContent = `
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Security awareness check</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f4f6fa;color:#192235;font-family:Arial,Helvetica,sans-serif}.shell{max-width:760px;margin:0 auto;padding:48px 20px}.card{overflow:hidden;border:1px solid #e5e8ef;border-radius:16px;background:#fff;box-shadow:0 14px 40px rgba(25,34,53,.08)}.hero{padding:40px;background:#151b2c;color:#fff}.body{padding:36px 40px}.eyebrow{margin:0 0 12px;color:#15c8bc;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}h1{margin:0;font-size:34px;line-height:1.2}h2{margin:0 0 12px;font-size:20px}p{font-size:16px;line-height:1.7}.tips{margin:24px 0 0;padding:0;list-style:none}.tips li{margin:12px 0;padding-left:28px;position:relative;line-height:1.6}.tips li:before{content:'✓';position:absolute;left:0;color:#5146d9;font-weight:700}@media(max-width:560px){.shell{padding:20px 12px}.hero,.body{padding:28px 22px}h1{font-size:28px}}</style></head>
<body><main class="shell"><article class="card"><header class="hero"><p class="eyebrow">Security awareness</p><h1>This was a simulated security check</h1></header><section class="body"><h2>Good catch, {{.FirstName}}.</h2><p>The message sent to {{.Email}} was part of a security-awareness exercise. It used urgency and an account link to encourage a quick response.</p><ul class="tips"><li>Pause before acting on unexpected requests.</li><li>Check the sender and destination carefully.</li><li>Open important services from a trusted bookmark.</li><li>Report suspicious messages through your usual security channel.</li></ul><p>No account information is needed on this page.</p></section></article></main></body></html>`;

export function initialEditorHtml(mode: "email" | "page", savedHtml?: string) {
  return (
    savedHtml ?? (mode === "email" ? emailStarterContent : pageStarterContent)
  );
}

export function buildEditorHtml(body: string, css: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>${css}</style></head><body>${body}</body></html>`;
}
