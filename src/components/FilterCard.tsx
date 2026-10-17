import type { ReactNode } from "react"

type FilterCardVariant = "dashboard" | "list" | "compact" | "event"

type FilterCardProps = {
  children: ReactNode
  variant?: FilterCardVariant
}

export function FilterCard({ children, variant = "dashboard" }: FilterCardProps) {
  return (
    <section className={`filter-card filter-card--${variant}`}>
      <div className="filter-card__controls">{children}</div>
    </section>
  )
}
