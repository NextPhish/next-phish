import {
  TargetGroupForm,
  TargetGroupCreateHeading,
} from "@/src/components/organisms/target-groups/target-group-form";
export default function NewTargetGroupPage() {
  return (
    <div className="grid min-w-0 gap-6">
      <TargetGroupCreateHeading />
      <section className="np-card min-w-0 p-6">
        <TargetGroupForm />
      </section>
    </div>
  );
}
