import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/projectlist");
  }

  return (
    <LoginForm />
  );
}
