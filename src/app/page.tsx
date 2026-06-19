import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession();

  redirect(session ? "/projectlist" : "/auth/login");
}
