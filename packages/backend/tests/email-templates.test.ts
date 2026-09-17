import { describe, it, expect } from "vitest";
import { load } from "cheerio";
import { renderTemplate } from "../src/email/templates";
const url =
  "https://example.com/verify?token=" + "x".repeat(300) + "&callbackURL=%2F";
const locals = {
  url,
  otp: "123456",
  name: 'Alex <img src=x onerror="alert(1)">',
  inviterName: "Morgan & Co",
  organizationName: "Acme <script>alert(1)</script>",
  inviteLink: url,
  magicLink: url,
};
describe("system email rendering", () => {
  for (const name of [
    "verify-email",
    "magic-link",
    "password-reset",
    "organization-invitation",
    "welcome-user",
    "otp",
  ] as const) {
    it(`renders ${name} through the compiled MJML master`, () => {
      const html = renderTemplate(name, locals);
      const $ = load(html);
      expect(html).not.toContain("<mjml");
      expect(html).not.toContain("NP_EMAIL_TOKEN_");
      expect(html).not.toContain("<%=");
      expect($("title").text()).not.toBe("");
      expect($("body").text()).toContain("nextphish.");
      expect(html).toContain("#151b2c");
      expect($("script,img")).toHaveLength(0);
      if (name !== "otp") {
        expect(
          $("a")
            .toArray()
            .filter((a) => $(a).attr("href") === url),
        ).toHaveLength(2);
        expect($(".fallback a").css("word-break")).toBe("break-all");
      } else expect($("body").text()).toContain("123456");
    });
  }
  it("escapes organization and recipient names without losing their text", () => {
    const $ = load(renderTemplate("organization-invitation", locals));
    expect($("body").text()).toContain(locals.organizationName);
    expect($("body").text()).toContain(locals.inviterName);
    expect(
      load(renderTemplate("welcome-user", locals))("body").text(),
    ).toContain(locals.name);
  });
});
