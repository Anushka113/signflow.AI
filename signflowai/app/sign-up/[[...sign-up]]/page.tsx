import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,217,245,0.06) 0%, transparent 60%)' }} />
      <SignUp />
    </div>
  );
}
