import { OrganizationDetail } from "@/src/components/organisms/organizations";

export const dynamic = "force-dynamic";

export default async function OrganizationManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrganizationDetail organizationId={id} />;
}
