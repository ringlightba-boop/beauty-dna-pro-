import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Sidebar } from "@/components/painel/Sidebar";
import { MobileTabBar } from "@/components/painel/MobileTabBar";

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar professionalName={profile!.professional_name} />
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileTabBar />
        <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
