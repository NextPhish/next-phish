"use client";
import { useParams } from "next/navigation";
import { SendingProfileForm } from "@/src/components/organisms/sending-profiles";
export default function EditSendingProfilePage() {
  const { id } = useParams<{ id: string }>();
  return <SendingProfileForm profileId={id} />;
}
