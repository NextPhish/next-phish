"use client";
import { useParams } from "next/navigation";
import { TargetGroupDetail } from "@/src/components/organisms/target-groups/target-group-detail";
export default function TargetGroupDetailPage() {
  const params = useParams();
  return <TargetGroupDetail groupId={params.id as string} />;
}
