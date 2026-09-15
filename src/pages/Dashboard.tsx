import { useMemo } from 'react';
import { Activity, FileText, TrendingDown, Clock, CheckCircle2, AlertCircle, ArrowUpRight, PlusCircle, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { memos } from '../data/memoData';
import { reports } from '../data/sellOutData';

/* ── Data ── */
const programColors: Record<string, string> = {
  Rafaksi: '#B45309',
  Visibility: '#D97706',
  Diskon: '#2563EB',
  Banded: '#16A34A',
  'Free Product': '#7C3AED',
  'Sewa Space': '#0F766E',
};

const pendingStatuses = ['Draft', 'Submitted', 'Menunggu Buyer', 'Menunggu Checker'];

/* ── Stat Card ── */
function StatCard({
  label, value, sub, icon: Icon, iconBg, iconColor, trend, trendLabel,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  trend?: 'up' | 'down' | 'neutral'; trendLabel?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trendLabel && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-700' :
              trend === 'down' ? 'bg-red-50 text-red-600' :
              'bg-slate-100 text-slate-500'
            }`}
          >
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trendLabel}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { selectedOutlet } = useApp();
  const outletLabel = selectedOutlet ?? 'Semua Outlet';

  const dashboard = useMemo(() => {
    const filteredMemos = selectedOutlet
      ? memos.filter((memo) => memo.outlets.includes(selectedOutlet))
      : memos;
    const filteredReports = selectedOutlet
      ? reports.filter((report) => report.outlets.includes(selectedOutlet))
      : reports;

    const programData = Object.entries(
      filteredMemos.reduce<Record<string, number>>((acc, memo) => {
        acc[memo.program] = (acc[memo.program] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, color: programColors[name] ?? '#64748B' }));

    const activities = [
      ...filteredMemos.slice(0, 6).map((memo) => {
        const approved = memo.status.includes('Approved') || memo.status === 'Sell Out Generated';
        const pending = pendingStatuses.includes(memo.status);
        return {
          id: memo.no,
          actor: approved ? memo.buyer : memo.createdBy ?? 'Supplier User',
          time: memo.submittedAt ?? memo.createdAt ?? memo.tanggal,
          desc: `${memo.program} - ${memo.supplier} (${memo.outlets.join(', ')})`,
          icon: approved ? CheckCircle2 : pending ? AlertCircle : PlusCircle,
          iconColor: approved ? 'text-emerald-600' : pending ? 'text-orange-500' : 'text-blue-500',
          iconBg: approved ? 'bg-emerald-50' : pending ? 'bg-orange-50' : 'bg-blue-50',
        };
      }),
      ...filteredReports.slice(0, 3).map((report) => ({
        id: report.id,
        actor: 'System',
        time: report.tanggal,
        desc: `Sell out ${report.supplier} (${report.outlets.join(', ')})`,
        icon: TrendingDown,
        iconColor: 'text-amber-700',
        iconBg: 'bg-amber-50',
      })),
    ].slice(0, 7);

    return { filteredMemos, filteredReports, programData, activities };
  }, [selectedOutlet]);

  const maxCount = Math.max(...dashboard.programData.map((d) => d.count), 1);
  const draftCount = dashboard.filteredMemos.filter((memo) => memo.status === 'Draft').length;
  const pendingCount = dashboard.filteredMemos.filter((memo) => pendingStatuses.includes(memo.status)).length;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ringkasan operasional memo & sell out untuk {outletLabel}.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Update terakhir: 7 Sep 2026, 09:41</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-3 py-1.5">
            {outletLabel}
          </span>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Riwayat Aktivitas"
          value={dashboard.activities.length}
          sub={`Aktivitas ${outletLabel}`}
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend="up"
          trendLabel="+14% bulan ini"
        />
        <StatCard
          label="Jumlah Draft Memo"
          value={draftCount}
          sub={`${pendingCount} memo perlu aksi`}
          icon={FileText}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          trend="neutral"
          trendLabel="12 perlu aksi"
        />
        <StatCard
          label="Data Riwayat Sell Out"
          value={dashboard.filteredReports.length}
          sub="Total laporan ter-generate"
          icon={TrendingDown}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          trend="up"
          trendLabel="+8 bulan ini"
        />
      </div>

      {/* ── Main content row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Program Distribution Chart — spans 3 cols */}
        <div className="xl:col-span-3 bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Jumlah Memo per Program</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Distribusi memo aktif berdasarkan jenis program</p>
            </div>
            <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              Nov 2023
            </span>
          </div>

          {/* Horizontal bar chart */}
          <div className="flex-1 space-y-3.5">
            {dashboard.programData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-[13px] text-muted-foreground">
                Belum ada memo untuk filter outlet ini.
              </div>
            ) : dashboard.programData.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground font-medium w-16 shrink-0 text-right">
                  {p.name}
                </span>
                <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                  <div
                    className="h-full rounded-md flex items-center justify-end pr-2.5 transition-all duration-500"
                    style={{
                      width: `${(p.count / maxCount) * 100}%`,
                      background: p.color,
                    }}
                  >
                    <span className="text-[11px] text-white font-bold">{p.count}</span>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground w-8 shrink-0">
                  {Math.round((p.count / dashboard.programData.reduce((s, x) => s + x.count, 0)) * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* Legend total */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total memo aktif</span>
            <span className="text-sm font-bold text-foreground">
              {dashboard.filteredMemos.length} memo
            </span>
          </div>
        </div>

        {/* Recent Activity — spans 2 cols */}
        <div className="xl:col-span-2 bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">Riwayat Aktivitas</h2>
            <a href="/laporan/sell-out" className="text-[11px] text-amber-700 hover:text-amber-600 font-semibold">
              Lihat semua
            </a>
          </div>

          <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-0.5">
            {dashboard.activities.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex gap-3 py-2.5 border-b border-border/60 last:border-0">
                  {/* Icon + timeline line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-7 h-7 rounded-full ${act.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${act.iconColor}`} />
                    </div>
                    {i < dashboard.activities.length - 1 && (
                      <div className="w-px flex-1 mt-1 bg-border min-h-[12px]" />
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0 pb-0.5">
                    <p className="text-[12px] font-semibold text-foreground leading-snug">{act.id}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug truncate">{act.desc}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {act.actor}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{act.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
