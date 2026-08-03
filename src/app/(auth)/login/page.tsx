import Image from "next/image";
import type { Metadata } from "next";
import { HeadsetIcon, EnvelopeIcon } from "@/shared/components/icons";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — EOS ERP Portal",
  description: "Sri Eshwar College of Engineering ERP portal login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative isolate overflow-hidden bg-linear-to-r from-blue-800 via-blue-700 to-blue-500 px-6 py-5 sm:px-10">
        <div className="animate-header-glow absolute inset-y-0 left-0 z-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative z-10 mx-auto flex max-w-7xl items-center gap-4">
          <Image
            src="/assest/secelogo.png"
            alt="Sri Eshwar College of Engineering logo"
            width={148}
            height={148}
            priority
            className="h-12 w-12 shrink-0 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold leading-tight text-white sm:text-xl">
              Sri Eshwar College of Engineering
            </h1>
            <p className="text-xs font-medium tracking-wide text-blue-100">LEADERSHIP &amp; EXCELLENCE</p>
          </div>
        </div>
      </header>

      <main className="relative flex-1 bg-white">
        <Image
          src="/assest/anotherangle.png"
          alt=""
          fill
          priority
          className="object-cover object-bottom opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-white/20 to-white/50" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:px-10 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="text-lg font-medium text-slate-700">Welcome to</p>
            <h2 className="text-4xl font-extrabold text-blue-700 sm:text-5xl">EOS Portal</h2>
            <span className="mt-4 block h-1 w-16 rounded-full bg-blue-500" />
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
              A unified platform to streamline academic, administrative and communication
              processes for students, faculty, parents and staff.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <LoginForm />
          </div>
        </div>
      </main>

      <footer className="bg-blue-950 px-6 py-4 text-xs text-blue-100 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p>&copy; 2026 Sri Eshwar College of Engineering. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <HeadsetIcon className="h-4 w-4" />
              Need Help? Contact ERP Support
            </span>
            <span className="flex items-center gap-1.5">
              <EnvelopeIcon className="h-4 w-4" />
              erp@srec.ac.in
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
