import { describe, expect, it } from "vitest";
import {
  CreateApiKeyInputSchema,
  DeleteApiKeyInputSchema,
} from "../src/api-key";
import {
  CampaignExecutionSummarySchema,
  ListCampaignEventsSchema,
  ListCampaignRecipientsSchema,
  SetCampaignDeliveryEnabledSchema,
} from "../src/campaign";
import {
  GetSiteImportByJobIdSchema,
  ListSiteImportsSchema,
} from "../src/site-import";

describe("router input validations", () => {
  it("preserves API key input bounds and arbitrary permission payloads", () => {
    expect(
      CreateApiKeyInputSchema.parse({
        expiresInDays: 365,
        permissions: "provider-defined-permissions",
        rateLimitTimeWindow: 1000,
      }),
    ).toEqual({
      expiresInDays: 365,
      permissions: "provider-defined-permissions",
      rateLimitTimeWindow: 1000,
    });
    expect(() =>
      CreateApiKeyInputSchema.parse({ expiresInDays: 366 }),
    ).toThrow();
    expect(DeleteApiKeyInputSchema.parse({ keyId: "" })).toEqual({ keyId: "" });
  });

  it("applies campaign delivery pagination defaults and bounds", () => {
    expect(
      ListCampaignRecipientsSchema.parse({ campaignId: "campaign-1" }),
    ).toEqual({ campaignId: "campaign-1", limit: 50, offset: 0 });
    expect(
      ListCampaignEventsSchema.parse({
        campaignId: "campaign-1",
        campaignRecipientId: "recipient-1",
      }),
    ).toEqual({
      campaignId: "campaign-1",
      campaignRecipientId: "recipient-1",
      limit: 50,
      offset: 0,
    });
    expect(() =>
      ListCampaignRecipientsSchema.parse({
        campaignId: "campaign-1",
        limit: 201,
      }),
    ).toThrow();
  });

  it("requires campaign identifiers for delivery mutations and summaries", () => {
    expect(
      SetCampaignDeliveryEnabledSchema.parse({
        campaignId: "campaign-1",
        deliveryEnabled: false,
      }),
    ).toEqual({ campaignId: "campaign-1", deliveryEnabled: false });
    expect(
      CampaignExecutionSummarySchema.parse({ campaignId: "campaign-1" }),
    ).toEqual({ campaignId: "campaign-1" });
    expect(() =>
      CampaignExecutionSummarySchema.parse({ campaignId: "" }),
    ).toThrow();
  });

  it("preserves optional site import lists and their default limit", () => {
    expect(ListSiteImportsSchema.parse(undefined)).toBeUndefined();
    expect(ListSiteImportsSchema.parse({})).toEqual({ limit: 20 });
    expect(() => ListSiteImportsSchema.parse({ limit: 51 })).toThrow();
    expect(GetSiteImportByJobIdSchema.parse({ jobId: "" })).toEqual({
      jobId: "",
    });
  });
});
