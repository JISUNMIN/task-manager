import Navbar from "@/components/layout/navbar/Navbar";
import UserStoreInitializer from "@/components/system/UserStoreInitializer";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <>
      <UserStoreInitializer />
      <Navbar />
      <main className="pt-14">{children}</main>
    </>
  );
}
