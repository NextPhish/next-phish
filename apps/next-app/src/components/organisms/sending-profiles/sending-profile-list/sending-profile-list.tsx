"use client";

import { useSendingProfileList } from "./hooks/use-sending-profile-list";
import { SendingProfileListView } from "./parts/sending-profile-list-view";

export function SendingProfileList() {
  const model = useSendingProfileList();
  return <SendingProfileListView {...model} />;
}
