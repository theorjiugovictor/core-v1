import { redirect } from "next/navigation";
import { getUserProfileAction } from "@/lib/actions";
import { SettingsForm } from "@/components/settings-form";
import { DataExport } from "@/components/data-export";

export default async function SettingsPage() {
  const user = await getUserProfileAction();

  if (!user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <SettingsForm user={user} />
      <DataExport />
    </div>
  );
}
