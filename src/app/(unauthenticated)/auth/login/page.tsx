import LoginForm from "./LoginForm";
import LogoutOnMount from "./LogoutOnMount";

export default function LoginPage() {
  return (
    <>
      <LogoutOnMount />
      <LoginForm />
    </>
  );
}
