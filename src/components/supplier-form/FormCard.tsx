import type { ElementType, ReactNode } from "react"

export default function FormCard({ title, icon: Icon, subtitle, children, className = "" }: {
  title: string
  icon: ElementType
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return <div className={`relative rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
    <div className="flex items-center gap-3 rounded-t-2xl border-b border-slate-100 bg-gradient-to-r from-slate-50 to-amber-50/50 px-6 py-4">
      <div data-shared-card-icon="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-600/10">
        <Icon className="h-4 w-4 text-amber-700" />
      </div>
      <div>
        <h2 className="text-[13px] font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
    <div className="space-y-5 p-6">{children}</div>
  </div>
}
