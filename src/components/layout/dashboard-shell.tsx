import { BookOpen, ClipboardCheck, LayoutDashboard, LineChart, MessageSquareText, Users } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

const roleItems = {
  admin: ["Students", "Teachers", "Course Management", "Analytics"],
  teacher: ["Courses", "Materials", "Quizzes", "Student Monitoring"],
  student: ["Learning", "AI Tutor", "Quizzes", "Progress"],
};

const icons = [LayoutDashboard, Users, BookOpen, ClipboardCheck, MessageSquareText, LineChart];

type DashboardShellProps = {
  role: keyof typeof roleItems;
  title: string;
};

export function DashboardShell({ role, title }: DashboardShellProps) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="glass-card m-4 rounded-2xl p-5 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
        <p className="font-heading text-2xl font-bold text-primary">EduSphere AI</p>
        <nav className="mt-8 space-y-2">
          {roleItems[role].map((item, index) => {
            const Icon = icons[index] ?? LayoutDashboard;
            return (
              <a
                className="flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-sm text-on-surface-variant hover:bg-surface-container-low"
                href="#"
                key={item}
              >
                <Icon aria-hidden className="size-4" />
                {item}
              </a>
            );
          })}
        </nav>
        <div className="mt-8">
          <LogoutButton />
        </div>
      </aside>
      <section className="mx-auto w-full max-w-container px-6 py-8">
        <div className="mb-8">
          <p className="font-mono text-sm uppercase tracking-wide text-secondary">{role}</p>
          <h1 className="font-heading text-4xl font-bold">{title}</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roleItems[role].map((item) => (
            <article className="glass-card rounded-2xl p-6" key={item}>
              <p className="font-heading text-xl font-semibold">{item}</p>
              <p className="mt-2 text-sm text-on-surface-variant">Feature workspace placeholder for the next build step.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
