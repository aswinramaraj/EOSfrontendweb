interface ComingSoonPageProps {
  title: string;
  description: string;
}

/** Honest placeholder for nav destinations added to the sidebar ahead of their own build pass — no fabricated content, just says so. */
export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div>
      <h1 className="text-[34px] font-extrabold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1.5 text-[15px] text-slate-500">{description}</p>

      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-base font-bold text-slate-700">This page isn&apos;t built yet</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          It&apos;s in the sidebar to match the planned navigation, but the real page hasn&apos;t been built out yet.
        </p>
      </div>
    </div>
  );
}
