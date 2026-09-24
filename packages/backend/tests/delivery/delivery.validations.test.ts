import { describe, expect, it } from "vitest";
import { IgnoredNetworkIdSchema } from "../../src/delivery";

describe("delivery router validations", () => {
  it("requires an ignored-network identifier", () => {
    expect(IgnoredNetworkIdSchema.parse({ id: "network-1" })).toEqual({
      id: "network-1",
    });
    expect(() => IgnoredNetworkIdSchema.parse({ id: "" })).toThrow();
  });
});
