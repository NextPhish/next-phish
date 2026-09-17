"use client";
import { useParams } from "next/navigation";
import { SendingProfileFormContainer } from "@/src/components/organisms/sending-profiles";
export default function EditSendingProfilePage() {
  const { id } = useParams<{ id: string }>();
  return <SendingProfileFormContainer profileId={id} />;
}
