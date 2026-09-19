import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, FileText, BarChart2, Users, Box, Truck, Tag, Layers,
  Percent, LogOut, Bell, Search, ChevronDown, PlusCircle, List,
  ShoppingCart, Settings, HelpCircle, KeyRound, User, Eye, EyeOff, X,
  ClipboardCheck, DollarSign, Menu, Store, Shield, TrendingUp,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { OutletHeaderBadge } from '../components/OutletBar';
import { useApp } from '../context/AppContext';
import { memos } from '../data/memoData';
import { reports } from '../data/sellOutData';
import mannaKampusLogo from '../../logo.png';

const pendingStatuses = ['Menunggu Buyer', 'Menunggu Checker', 'Setting Harga'];

function MannaKampusLogo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      src={mannaKampusLogo}
      alt="Manna Kampus"
      className={compact ? 'h-8 w-auto max-w-[92px] object-contain' : 'h-9 w-auto object-contain'}
    />
  );
}

function buildNotifications(selectedOutlet: string | null) {
  const filteredMemos = selectedOutlet
    ? memos.filter((memo) => memo.outlets.includes(selectedOutlet))
    : memos;
  const filteredReports = selectedOutlet
    ? reports.filter((report) => report.outlets.includes(selectedOutlet))
    : reports;

  return [
    ...filteredMemos
      .filter((memo) => pendingStatuses.includes(memo.status))
      .map((memo) => ({
        id: memo.no,
        title: memo.status === 'Menunggu Buyer'
          ? 'Menunggu approval buyer'
          : memo.status === 'Menunggu Checker'
            ? 'Menunggu checker pembayaran'
            : 'Perlu setting harga',
        message: `${memo.supplier} - ${memo.program}`,
        meta: memo.outlets.join(', '),
        tone: memo.status === 'Menunggu Buyer'
          ? 'amber'
          : memo.status === 'Menunggu Checker'
            ? 'blue'
            : 'emerald',
        href: memo.status === 'Setting Harga' ? '/program-supplier/setting-harga' : `/program-supplier/memo/${memo.no}`,
      })),
    ...filteredReports.slice(0, 3).map((report) => ({
      id: report.id,
      title: 'Sell out siap direview',
      message: `${report.laporan} - ${report.supplier}`,
      meta: report.outlets.join(', '),
      tone: 'slate',
      href: `/laporan/sell-out/${report.id}`,
    })),
  ].slice(0, 8);
}

/* ── Modal shell ── */
function ModalShell({ onClose, title, icon: Icon, iconColor = 'text-amber-600', iconBg = 'bg-amber-50', children, footer }: {
  onClose: () => void; title: string; icon: React.ElementType;
  iconColor?: string; iconBg?: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 pointer-events-auto overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <h3 className="text-[14px] font-bold text-slate-800">{title}</h3>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-5">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Ubah Password Modal ── */
function UbahPasswordModal({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all placeholder:text-slate-400";
  return (
    <ModalShell onClose={onClose} title="Ubah Password" icon={KeyRound}>
      <div className="space-y-4">
        {([
          { label: 'Password Lama', key: 'old' as const },
          { label: 'Password Baru', key: 'new' as const },
          { label: 'Konfirmasi Password Baru', key: 'confirm' as const },
        ]).map(({ label, key }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-[12px] font-semibold text-slate-700">{label}</label>
            <div className="relative">
              <input type={show[key] ? 'text' : 'password'} className={`${inputCls} pr-10`} placeholder="••••••••" />
              <button type="button" onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {show[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

/* ── Profile Dropdown ── */
function NotificationDropdown({ notifications, outletLabel, onClose }: {
  notifications: ReturnType<typeof buildNotifications>;
  outletLabel: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const toneCls: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose} />
      <div className="absolute right-0 top-full mt-3 z-[51] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-slate-800">Notifikasi</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Alert aktif untuk {outletLabel}</p>
            </div>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 border border-red-100">
              {notifications.length} aktif
            </span>
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
              <p className="text-[13px] font-semibold text-slate-700">Tidak ada notifikasi</p>
              <p className="text-[11px] text-slate-400 mt-1">Semua aman untuk filter outlet ini.</p>
            </div>
          ) : notifications.map((notif) => (
            <button
              key={`${notif.id}-${notif.title}`}
              onClick={() => { onClose(); navigate(notif.href); }}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className={clsx('mt-0.5 h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center', toneCls[notif.tone])}>
                <Bell className="w-3.5 h-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold text-slate-800">{notif.title}</span>
                <span className="block text-[12px] text-slate-600 truncate mt-0.5">{notif.id} - {notif.message}</span>
                <span className="block text-[10px] text-slate-400 mt-1">{notif.meta}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
          <button
            onClick={() => { onClose(); navigate('/program-supplier/approval'); }}
            className="text-[12px] font-semibold text-amber-700 hover:text-amber-800"
          >
            Lihat semua antrian
          </button>
        </div>
      </div>
    </>
  );
}

function ProfileDropdown({ initials, name, role, onClose, onChangePassword, onLogout }: {
  initials: string; name: string; role: string;
  onClose: () => void; onChangePassword: () => void; onLogout: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 z-[51] w-56 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-800 truncate">{name}</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{role}</p>
            </div>
          </div>
        </div>
        <div className="p-1.5">
          <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors" onClick={onClose}>
            <User className="w-4 h-4 text-slate-400" /> Profil Saya
          </button>
          <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors" onClick={() => { onClose(); onChangePassword(); }}>
            <KeyRound className="w-4 h-4 text-slate-400" /> Ubah Password
          </button>
        </div>
        <div className="p-1.5 border-t border-slate-100">
          <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-xl transition-colors" onClick={() => { onClose(); onLogout(); }}>
            <LogOut className="w-4 h-4 text-red-500" /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Nav Group ── */
function NavGroup({ label, icon: Icon, id, open, onToggle, children, badge, active }: {
  label: string; icon: React.ElementType; id: string; open: boolean;
  onToggle: (id: string) => void; children: React.ReactNode; badge?: number; active?: boolean;
}) {
  return (
    <div>
      <button
        onClick={() => onToggle(id)}
        className={clsx(
          "flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-150 group",
          active ? "text-amber-700 bg-amber-50/50 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={clsx("w-[16px] h-[16px] shrink-0", active ? "text-amber-600" : "text-slate-400")} />
          <span className="text-[13px]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge !== undefined && badge > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold bg-amber-600 text-white">
              {badge}
            </span>
          )}
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', active ? 'text-amber-600' : 'text-slate-400', open ? 'rotate-0' : '-rotate-90')} />
        </div>
      </button>
      <div className={clsx('overflow-hidden transition-all duration-200', open ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0')}>
        <div className="ml-4 pl-4 space-y-1 border-l-2 border-slate-100 py-1">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Nav Link ── */
function SideNavLink({ to, icon: Icon, label, badge, onClick }: { to: string; icon?: React.ElementType; label: string; badge?: number; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
          isActive 
            ? 'font-bold text-amber-700 bg-[#FEF3C7]' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            {Icon && <Icon className={clsx("w-[15px] h-[15px] shrink-0", isActive ? "text-amber-600" : "text-slate-400")} />}
            {label}
          </div>
          {badge !== undefined && badge > 0 && (
            <span className={clsx("min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold", isActive ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-600")}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ── Sidebar content ── */
function SidebarContent({ openMenus, toggleMenu, onNavClick, onLogout, isProgramActive, isMasterActive, isLaporanActive, isPenjualanActive }: {
  openMenus: Record<string, boolean>;
  toggleMenu: (id: string) => void;
  onNavClick?: () => void;
  onLogout: () => void;
  isProgramActive: boolean;
  isMasterActive: boolean;
  isLaporanActive: boolean;
  isPenjualanActive: boolean;
}) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NavLink
          to="/dashboard"
          onClick={onNavClick}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150', 
            isActive ? 'font-bold text-amber-700 bg-[#FEF3C7]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
          )}
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={clsx("w-[16px] h-[16px] shrink-0", isActive ? "text-amber-600" : "text-slate-400")} /> Dashboard
            </>
          )}
        </NavLink>

        <div className="pt-4">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Data Master</p>
          <NavGroup label="Master Data" icon={Settings} id="master" open={openMenus.master} onToggle={toggleMenu} active={isMasterActive}>
            <SideNavLink to="/master-data/user" icon={Users} label="User" onClick={onNavClick} />
            <SideNavLink to="/master-data/hak-akses" icon={Shield} label="Role" onClick={onNavClick} />
            <SideNavLink to="/master-data/produk" icon={Box} label="Produk (Barang)" onClick={onNavClick} />
            <SideNavLink to="/master-data/supplier" icon={Truck} label="Supplier" onClick={onNavClick} />
            <SideNavLink to="/master-data/outlet" icon={Store} label="Outlet" onClick={onNavClick} />
            <SideNavLink to="/master-data/jenis-memo" icon={Tag} label="Jenis Memo" onClick={onNavClick} />
            <SideNavLink to="/master-data/jenis-program" icon={Layers} label="Jenis Program" onClick={onNavClick} />
            <SideNavLink to="/master-data/pajak" icon={Percent} label="Pajak" onClick={onNavClick} />
            <SideNavLink to="/master-data/penjualan" icon={TrendingUp} label="Penjualan" onClick={onNavClick} />
          </NavGroup>
        </div>

        <div className="pt-4">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Purchasing</p>
          <NavGroup label="Program Supplier" icon={ShoppingCart} id="program" open={openMenus.program} onToggle={toggleMenu} active={isProgramActive} badge={5}>
            <SideNavLink to="/program-supplier/memo" icon={List} label="List Memo" badge={3} onClick={onNavClick} />
            <SideNavLink to="/program-supplier/memo/create" icon={PlusCircle} label="Buat Memo" onClick={onNavClick} />
            <SideNavLink to="/program-supplier/approval" icon={ClipboardCheck} label="Antrian Approval" badge={2} onClick={onNavClick} />
            <SideNavLink to="/program-supplier/setting-harga" icon={DollarSign} label="Setting Harga" onClick={onNavClick} />
          </NavGroup>
          <NavGroup label="Penjualan" icon={TrendingUp} id="penjualan" open={openMenus.penjualan} onToggle={toggleMenu} active={isPenjualanActive}>
            <SideNavLink to="/purchasing/penjualan/laporan" icon={BarChart2} label="Laporan Penjualan" onClick={onNavClick} />
            <SideNavLink to="/purchasing/penjualan/data" icon={List} label="Data Penjualan" onClick={onNavClick} />
            {/* <SideNavLink to="/purchasing/penjualan/cetak" icon={FileText} label="Cetak Penjualan" onClick={onNavClick} /> */}
          </NavGroup>
        </div>

        <div className="pt-4 pb-2">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Analytics</p>
          <NavGroup label="Laporan" icon={BarChart2} id="laporan" open={openMenus.laporan} onToggle={toggleMenu} active={isLaporanActive}>
            <SideNavLink to="/laporan/sell-out" icon={FileText} label="Riwayat Sell Out" onClick={onNavClick} />
          </NavGroup>
        </div>
      </nav>

      <div className="shrink-0 p-3 border-t border-slate-100 bg-white">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
          <HelpCircle className="w-[16px] h-[16px] shrink-0 text-slate-400" /> Bantuan
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-[13px] text-slate-600 hover:bg-red-50 hover:text-red-600 font-medium mt-1"
        >
          <LogOut className="w-[16px] h-[16px] shrink-0 text-slate-400 group-hover:text-red-500" /> Logout
        </button>
      </div>
    </>
  );
}

/* ── Layout ── */
export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, selectedOutlet } = useApp();
  const outletLabel = selectedOutlet ?? 'Semua Outlet';
  const notifications = buildNotifications(selectedOutlet);

  const isMasterActive = location.pathname.startsWith('/master-data');
  const isProgramActive = location.pathname.startsWith('/program-supplier');
  const isLaporanActive = location.pathname.startsWith('/laporan');
  const isPenjualanActive = location.pathname.startsWith('/purchasing/penjualan');

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    master: isMasterActive,
    program: isProgramActive || true,
    laporan: isLaporanActive,
    penjualan: isPenjualanActive,
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleMenu = (menu: string) => setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  const handleLogout = () => navigate('/login');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-[250px] shrink-0 flex-col h-screen border-r border-slate-200 bg-white shadow-sm z-20">
        <div className="h-16 flex items-center gap-3 px-5 shrink-0 border-b border-slate-100">
          <MannaKampusLogo compact />
          <div>
            <p className="font-bold text-[14px] leading-tight text-slate-800">BM Portal</p>
            <p className="text-[10px] leading-tight text-slate-500">Buyer Memo System</p>
          </div>
        </div>

        <SidebarContent
          openMenus={openMenus}
          toggleMenu={toggleMenu}
          onLogout={handleLogout}
          isProgramActive={isProgramActive}
          isMasterActive={isMasterActive}
          isLaporanActive={isLaporanActive}
          isPenjualanActive={isPenjualanActive}
        />
      </aside>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-[260px] z-50 flex flex-col bg-white border-r border-slate-200 shadow-2xl lg:hidden">
            <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <MannaKampusLogo compact />
                <div>
                  <p className="font-bold text-[14px] leading-tight text-slate-800">ERP Portal</p>
                  <p className="text-[10px] leading-tight text-slate-500">Buyer Memo System</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              onNavClick={() => setMobileOpen(false)}
              onLogout={handleLogout}
              isProgramActive={isProgramActive}
              isMasterActive={isMasterActive}
              isLaporanActive={isLaporanActive}
              isPenjualanActive={isPenjualanActive}
            />
          </aside>
        </>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 gap-4 bg-white border-b border-slate-200 shadow-sm relative">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center rounded-xl bg-slate-100 px-3.5 py-2 w-72 xl:w-96 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-400 border border-transparent">
              <Search className="w-4 h-4 mr-2.5 shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Cari memo, supplier..."
                className="bg-transparent border-none outline-none w-full text-[13px] text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block">
              <OutletHeaderBadge />
            </div>

            <button className="sm:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <div ref={notificationRef} className="relative">
              <button
                onClick={() => { setNotificationOpen((open) => !open); setProfileOpen(false); }}
                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Buka notifikasi"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <>
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                      {notifications.length}
                    </span>
                  </>
                )}
              </button>

              {notificationOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  outletLabel={outletLabel}
                  onClose={() => setNotificationOpen(false)}
                />
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotificationOpen(false); }}
                className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  {currentUser.initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[13px] font-bold leading-tight text-slate-800">{currentUser.nama}</p>
                  <p className="text-[11px] leading-tight text-slate-500 mt-0.5">{currentUser.role}</p>
                </div>
                <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform duration-150 hidden md:block', profileOpen && 'rotate-180')} />
              </button>

              {profileOpen && (
                <ProfileDropdown
                  initials={currentUser.initials}
                  name={currentUser.nama}
                  role={currentUser.role}
                  onClose={() => setProfileOpen(false)}
                  onChangePassword={() => setShowPwdModal(true)}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        {/* PADDING INI YANG MENENTUKAN GAP (p-5 md:p-6) ATAU SEKITAR 20-24px DARI NAVBAR */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>

      {showPwdModal && <UbahPasswordModal onClose={() => setShowPwdModal(false)} />}
    </div>
  );
}
