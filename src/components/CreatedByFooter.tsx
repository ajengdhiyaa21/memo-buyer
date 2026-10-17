export function CreatedByFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer
      className={`mt-6 flex flex-col gap-2 border-t pt-4 text-[10px] sm:flex-row sm:items-end sm:justify-between ${
        dark
          ? "border-white/10 text-slate-500"
          : "border-slate-200 text-slate-400"
      }`}
    >
      <div>
        <p className={dark ? "font-bold text-slate-400" : "font-bold text-slate-600"}>
          BM Portal
        </p>
        <p className="mt-0.5">Buyer Memo System</p>
      </div>
      <div className="text-left sm:text-right">
        <p>&copy; {new Date().getFullYear()} Created By</p>
        <p className={`mt-1 font-semibold ${dark ? "text-amber-500" : "text-amber-700"}`}>
          Division Software Engineering Manna Kampus
        </p>
      </div>
    </footer>
  )
}
