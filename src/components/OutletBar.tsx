import { MapPin, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp, OUTLET_META } from '../context/AppContext';

export function OutletBar() {
  const { currentUser, selectedOutlet, setSelectedOutlet } = useApp();
  const outlets = currentUser.assignedOutlets;
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const meta = selectedOutlet ? OUTLET_META[selectedOutlet] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 flex-wrap">
        {/* Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Filter Outlet</span>
        </div>

        <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />

        {/* Outlet chips */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          <button
            onClick={() => setSelectedOutlet(null)}
            className="px-3 py-1 rounded-xl text-[12px] font-semibold transition-all"
            style={!selectedOutlet
              ? { background: 'linear-gradient(135deg,#B45309,#D97706)', color:'#fff', boxShadow:'0 2px 6px rgba(180,83,9,0.28)' }
              : { background:'#F1F5F9', color:'#64748B' }
            }
          >
            Semua
          </button>
          {outlets.map((o) => (
            <button
              key={o}
              onClick={() => setSelectedOutlet(o)}
              className="px-3 py-1 rounded-xl text-[12px] font-semibold transition-all"
              style={selectedOutlet === o
                ? { background:'linear-gradient(135deg,#B45309,#D97706)', color:'#fff', boxShadow:'0 2px 6px rgba(180,83,9,0.28)' }
                : { background:'#F1F5F9', color:'#64748B' }
              }
            >
              {o}
            </button>
          ))}
        </div>

        {/* Active context pill */}
        {selectedOutlet && (
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background:'#FEF3C7', border:'1px solid #FCD34D' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold text-amber-800">Aktif: {selectedOutlet}</span>
          </div>
        )}
      </div>

      {/* Active outlet info strip */}
      {meta && (
        <div className="px-4 py-2 border-t border-amber-100 flex items-center gap-3"
          style={{ background:'linear-gradient(90deg,#FFFBEB,#FEF9F0)' }}>
          <span className="text-[11px] font-semibold text-amber-800">{meta.nama}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
            style={meta.tipe === 'Supermarket'
              ? { background:'#DBEAFE', color:'#1D4ED8' }
              : { background:'#EDE9FE', color:'#6D28D9' }
            }>{meta.tipe}</span>
          <span className="text-[11px] text-amber-600">{meta.kota}</span>
          <button
            onClick={() => setSelectedOutlet(null)}
            className="ml-auto text-[11px] text-amber-700 hover:text-amber-900 font-semibold transition-colors"
          >
            ✕ Reset
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Compact header badge (used in Layout) ── */
export function OutletHeaderBadge() {
  const { selectedOutlet, setSelectedOutlet, currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[12px] font-semibold"
        style={selectedOutlet
          ? { background:'#FEF3C7', borderColor:'#FCD34D', color:'#92400E' }
          : { background:'#F1F5F9', borderColor:'#E2E8F0', color:'#64748B' }
        }
      >
        <MapPin className="w-3 h-3" />
        {selectedOutlet ? `Outlet: ${selectedOutlet}` : 'Semua Outlet'}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-[46] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
            style={{ width: 220, boxShadow:'0 16px 40px -8px rgba(0,0,0,0.14)' }}>
            <div className="px-3 py-2.5 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilih Konteks Outlet</p>
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              <button
                onClick={() => { setSelectedOutlet(null); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-left transition-colors"
                style={!selectedOutlet ? { background:'#FEF3C7', color:'#92400E', fontWeight:600 } : { color:'#374151' }}
                onMouseEnter={(e) => { if (selectedOutlet) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                onMouseLeave={(e) => { if (selectedOutlet) (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                Semua Outlet
              </button>
              {currentUser.assignedOutlets.map((o) => (
                <button
                  key={o}
                  onClick={() => { setSelectedOutlet(o); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-left transition-colors"
                  style={selectedOutlet === o ? { background:'#FEF3C7', color:'#92400E', fontWeight:600 } : { color:'#374151' }}
                  onMouseEnter={(e) => { if (selectedOutlet !== o) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { if (selectedOutlet !== o) (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOutlet === o ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  {o}
                  <span className="ml-auto text-[10px] text-slate-400">
                    {OUTLET_META[o]?.tipe === 'Supermarket' ? 'SM' : 'MM'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
