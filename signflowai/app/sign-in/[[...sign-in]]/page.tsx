import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,245,160,0.06) 0%, transparent 60%)' }} />
      <SignIn />
    </div>
  );
}
