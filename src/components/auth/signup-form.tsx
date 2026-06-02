import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormProps = {
  role: "student" | "teacher";
  extraFieldLabel: string;
  extraFieldName: string;
};

export function SignupForm({ role, extraFieldLabel, extraFieldName }: SignupFormProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="glass-card w-full max-w-md rounded-2xl p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="ai-gradient flex size-11 items-center justify-center rounded-xl text-white">
            <GraduationCap aria-hidden className="size-6" />
          </div>
          <div>
            <p className="font-mono text-sm capitalize text-secondary">{role} access</p>
            <h1 className="font-heading text-3xl font-bold">Create Account</h1>
          </div>
        </div>
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={extraFieldName}>{extraFieldLabel}</Label>
            <Input id={extraFieldName} name={extraFieldName} placeholder={extraFieldLabel} />
          </div>
          <input type="hidden" name="role" value={role} />
          <Button className="w-full" type="submit">Create {role} account</Button>
        </form>
        <Link className="mt-6 block text-center text-sm font-medium text-primary" href="/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}
