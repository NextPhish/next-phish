import { CampaignDetail } from "@/src/components/organisms/campaigns";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  return <CampaignDetail id={id} saved={saved} />;
}
