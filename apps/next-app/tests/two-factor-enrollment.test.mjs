import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { twoFactor } from "better-auth/plugins";
import { twoFactorOptions } from "../src/server/auth/two-factor-options.ts";

const require = createRequire(import.meta.url);
const authRequire = createRequire(require.resolve("better-auth"));
const { createOTP } = await import(
  authRequire.resolve("@better-auth/utils/otp")
);
const { base32 } = await import(
  authRequire.resolve("@better-auth/utils/base32")
);

test("pending and rejected enrollment do not gate sign-in; verified enrollment does", async () => {
  const database = {
    user: [],
    session: [],
    account: [],
    verification: [],
    twoFactor: [],
  };
  const auth = betterAuth({
    baseURL: "http://localhost:3999",
    secret: "isolated-test-secret-at-least-thirty-two-characters",
    database: memoryAdapter(database),
    emailAndPassword: { enabled: true },
    plugins: [twoFactor(twoFactorOptions)],
  });
  const credentials = {
    email: "enrollment@example.test",
    password: "test-password-only-123",
  };
  const signup = await auth.api.signUpEmail({
    body: { ...credentials, name: "Enrollment test" },
    asResponse: true,
  });
  assert.equal(signup.status, 200);
  const headers = new Headers({
    cookie: signup.headers
      .getSetCookie()
      .map((cookie) => cookie.split(";")[0])
      .join("; "),
  });
  const enrollment = await auth.api.enableTwoFactor({
    body: { password: credentials.password },
    headers,
  });
  assert.ok(enrollment.totpURI);
  assert.equal(database.user[0].twoFactorEnabled, false);
  assert.equal(database.twoFactor[0].verified, false);

  await assert.rejects(
    auth.api.verifyTOTP({ body: { code: "invalid" }, headers }),
  );
  assert.equal(database.user[0].twoFactorEnabled, false);
  const pendingSignIn = await auth.api.signInEmail({ body: credentials });
  assert.ok(
    pendingSignIn.token,
    "Abandoned/invalid enrollment must allow password sign-in",
  );

  const encodedSecret = new URL(enrollment.totpURI).searchParams.get("secret");
  const secret = new TextDecoder().decode(base32.decode(encodedSecret));
  const code = await createOTP(secret).totp();
  await auth.api.verifyTOTP({ body: { code }, headers });
  assert.equal(database.user[0].twoFactorEnabled, true);
  assert.equal(database.twoFactor[0].verified, true);
  const verifiedSignIn = await auth.api.signInEmail({ body: credentials });
  assert.equal(verifiedSignIn.twoFactorRedirect, true);
});

test("a persistence failure during enrollment leaves password sign-in available", async () => {
  const database = {
    user: [],
    session: [],
    account: [],
    verification: [],
    twoFactor: [],
  };
  const adapter = memoryAdapter(database);
  const auth = betterAuth({
    baseURL: "http://localhost:3999",
    secret: "isolated-test-secret-at-least-thirty-two-characters",
    database: (options) => {
      const instance = adapter(options);
      return {
        ...instance,
        create: async (data) => {
          if (data.model === "twoFactor")
            throw new Error("Simulated enrollment storage failure");
          return instance.create(data);
        },
      };
    },
    emailAndPassword: { enabled: true },
    plugins: [twoFactor(twoFactorOptions)],
    logger: { disabled: true },
  });
  const credentials = {
    email: "failed-enrollment@example.test",
    password: "test-password-only-123",
  };
  const signup = await auth.api.signUpEmail({
    body: { ...credentials, name: "Failure test" },
    asResponse: true,
  });
  const headers = new Headers({
    cookie: signup.headers
      .getSetCookie()
      .map((cookie) => cookie.split(";")[0])
      .join("; "),
  });
  await assert.rejects(
    auth.api.enableTwoFactor({
      body: { password: credentials.password },
      headers,
    }),
  );
  assert.equal(database.user[0].twoFactorEnabled, false);
  const signIn = await auth.api.signInEmail({ body: credentials });
  assert.ok(signIn.token);
});
