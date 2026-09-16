"use client";
import { useParams } from "next/navigation";
import { TargetGroupDetailContainer } from "@/src/components/organisms/target-groups/detail-container";
export default function TargetGroupDetailPage() {
  const params = useParams();
  return <TargetGroupDetailContainer groupId={params.id as string} />;
}
