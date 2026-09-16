import { describe, expect, it, vi } from "vitest";
import { MailSendingProfileService } from "../../../src/mail-sending/services/mail-sending-profile.service";
import type { MailSendingProfileRepository } from "../../../src/mail-sending/repositories";
import type { MailProviderRegistry } from "../../../src/mail-sending/registry";
import type { MailProfileCacheService } from "../../../src/mail-sending/services/mail-profile-cache.service";
import { MailProviderType } from "../../../src/mail-sending/providers/mail-provider.types";

function fixture() {
  const row = {
    id: "profile-1",
    organizationId: "org-1",
    name: "Mail",
    providerType: MailProviderType.SMTP,
    fromName: "Sender",
    fromEmail: "sender@example.com",
    replyToEmail: null,
    headers: null,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    providerConfig: { host: "smtp.example.com", password: { encrypted: true } },
  };
  const repo = {
    findById: vi.fn().mockResolvedValue(row),
    update: vi
      .fn()
      .mockImplementation(async (_id, _org, data) => ({ ...row, ...data })),
  };
  const provider = {
    sensitiveFields: ["password"],
    validateConfig: vi.fn().mockImplementation(async (config) => config),
  };
  const registry = { get: vi.fn().mockReturnValue(provider) };
  const cache = {
    decryptSensitiveFields: vi.fn().mockImplementation((config) => ({
      ...config,
      password: "existing-secret",
    })),
    encryptSensitiveFields: vi.fn().mockImplementation((config) => ({
      ...config,
      password: { encrypted: config.password },
    })),
    invalidate: vi.fn().mockResolvedValue(undefined),
  };
  const service = new MailSendingProfileService(
    repo as unknown as MailSendingProfileRepository,
    registry as unknown as MailProviderRegistry,
    cache as unknown as MailProfileCacheService,
  );
  return { service, repo, provider, cache };
}

describe("mail profile secret edits", () => {
  it("reuses the real secret when the edit form submits the redacted marker", async () => {
    const { service, provider, cache } = fixture();
    await service.update("profile-1", "org-1", {
      name: "Renamed",
      providerConfig: { host: "smtp.new.example", password: "[REDACTED]" },
    });
    expect(provider.validateConfig).toHaveBeenCalledWith({
      host: "smtp.new.example",
      password: "existing-secret",
    });
    expect(cache.encryptSensitiveFields).toHaveBeenCalledWith(
      { host: "smtp.new.example", password: "existing-secret" },
      expect.anything(),
    );
  });
  it("uses an explicitly replaced secret", async () => {
    const { service, provider } = fixture();
    await service.update("profile-1", "org-1", {
      providerConfig: { host: "smtp.example.com", password: "new-secret" },
    });
    expect(provider.validateConfig).toHaveBeenCalledWith({
      host: "smtp.example.com",
      password: "new-secret",
    });
  });
  it("keeps missing and blank config semantics", async () => {
    const { service, provider, repo } = fixture();
    await service.update("profile-1", "org-1", { name: "Renamed" });
    expect(provider.validateConfig).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith("profile-1", "org-1", {
      name: "Renamed",
    });
    await service.update("profile-1", "org-1", {
      providerConfig: { host: "smtp.example.com", password: "" },
    });
    expect(provider.validateConfig).toHaveBeenCalledWith({
      host: "smtp.example.com",
      password: "",
    });
  });
});
