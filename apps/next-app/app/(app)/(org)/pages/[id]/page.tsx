"use client";

import { useParams } from "next/navigation";
import PageForm from "@/src/components/organisms/pages";

export default function PageEditorPage() {
  const params = useParams();

  return <PageForm pageId={params.id as string} />;
}
