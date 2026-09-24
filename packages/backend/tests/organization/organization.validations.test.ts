import { describe, expect, it } from "vitest";
import {
  DeleteOrganizationInputSchema,
  OrganizationDeliveryEnabledSchema,
  OrganizationIdSchema,
  OrganizationIgnoredNetworkSchema,
  OrganizationMemberEmailSchema,
  ResendOrganizationMemberWelcomeSchema,
  UpdateOrganizationInputSchema,
} from "../../src/organization";

describe("organization router validations", () => {
  it("normalizes member lookup email without changing the organization", () => {
    expect(
      OrganizationMemberEmailSchema.parse({
        organizationId: "organization-1",
        email: "  MEMBER@Example.COM ",
      }),
    ).toEqual({
      organizationId: "organization-1",
      email: "member@example.com",
    });
  });

  it("requires non-empty scoped identifiers", () => {
    expect(() => OrganizationIdSchema.parse({ organizationId: "" })).toThrow();
    expect(() =>
      ResendOrganizationMemberWelcomeSchema.parse({
        organizationId: "organization-1",
        userId: "",
      }),
    ).toThrow();
  });

  it("preserves organization update and ignored-network validation", () => {
    expect(
      UpdateOrganizationInputSchema.parse({
        organizationId: "organization-1",
        name: "Security Team",
        slug: "security-team",
      }),
    ).toEqual({
      organizationId: "organization-1",
      name: "Security Team",
      slug: "security-team",
    });
    expect(
      OrganizationIgnoredNetworkSchema.parse({
        organizationId: "organization-1",
        network: "  192.0.2.0/24  ",
        description: "  Office  ",
      }),
    ).toEqual({
      organizationId: "organization-1",
      network: "192.0.2.0/24",
      description: "Office",
    });
  });

  it("accepts only boolean delivery flags", () => {
    expect(
      OrganizationDeliveryEnabledSchema.parse({ deliveryEnabled: false }),
    ).toEqual({ deliveryEnabled: false });
    expect(() =>
      OrganizationDeliveryEnabledSchema.parse({ deliveryEnabled: "false" }),
    ).toThrow();
  });

  it("preserves the delete route's existing empty-id acceptance", () => {
    expect(DeleteOrganizationInputSchema.parse({ organizationId: "" })).toEqual(
      { organizationId: "" },
    );
  });
});
