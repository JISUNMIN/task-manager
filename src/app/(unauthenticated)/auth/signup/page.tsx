import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/projectlist");
  }

  return <SignupForm />;
}
