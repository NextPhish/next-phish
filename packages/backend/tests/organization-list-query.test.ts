import { expect, it, vi } from "vitest";
import { GetUserOrganizationsQuery } from "../src/organization/queries/get-user-organizations.query";
import type { OrganizationRepository } from "../src/organization/repositories";
import type { OrganizationService } from "../src/organization/services";

it("forwards role filters and sorting together with pagination", async () => {
  const findByUserId = vi.fn().mockResolvedValue({ rows: [], total: 2 });
  const query = new GetUserOrganizationsQuery(
    { findByUserId } as unknown as OrganizationRepository,
    { toViewList: () => [] } as unknown as OrganizationService,
  );
  const input = {
    userId: "user-1",
    limit: 10,
    offset: 20,
    search: "team",
    sort: [{ field: "createdAt" as const, order: "desc" as const }],
    filters: { role: "owner" },
  };
  await expect(query.execute(input)).resolves.toEqual({
    organizations: [],
    total: 2,
  });
  expect(findByUserId).toHaveBeenCalledWith("user-1", {
    limit: 10,
    offset: 20,
    search: "team",
    sort: input.sort,
    filters: input.filters,
  });
});
