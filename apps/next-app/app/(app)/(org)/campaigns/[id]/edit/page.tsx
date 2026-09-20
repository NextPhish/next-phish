import { CampaignForm } from "@/src/components/organisms/campaigns";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignForm campaignId={id} />;
}
