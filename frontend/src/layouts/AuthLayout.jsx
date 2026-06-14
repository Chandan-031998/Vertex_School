import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <img
        src="/images/school-campus-login.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[36%_center]"
      />
      <div className="absolute inset-0 bg-slate-950/45 md:bg-gradient-to-r md:from-slate-950/85 md:via-slate-950/50 md:to-slate-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/20" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.72fr)]">
        <section className="hidden flex-col justify-between px-12 py-10 text-white lg:flex xl:px-20 xl:py-14">
          <Brand />

          <div className="max-w-2xl pb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Smarter school operations, every day
            </div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.12] tracking-tight xl:text-6xl">
              One place to manage your entire school.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 xl:text-lg">
              Connect administrators, teachers, accountants, and parents with
              the tools they need to keep every school day running smoothly.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Secure access for your school community
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:bg-white/5 lg:px-10 lg:backdrop-blur-[2px] xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-5 flex justify-center text-white lg:hidden">
              <Brand compact />
            </div>
            <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
              {children}
            </div>
            <p className="mt-5 text-center text-xs text-white/75">
              © {new Date().getFullYear()} Vertex School Manager
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/25">
        <GraduationCap className="h-6 w-6" strokeWidth={2.2} />
      </div>
      <div>
        <div className={`${compact ? "text-lg" : "text-xl"} font-bold tracking-tight`}>
          Vertex
        </div>
        <div className="text-xs font-medium tracking-[0.16em] text-white/70">
          SCHOOL MANAGER
        </div>
      </div>
    </div>
  );
}
