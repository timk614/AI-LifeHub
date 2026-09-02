import { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Bell, BookOpen, Bot, ChevronRight, CircleHelp, Compass, Heart, History, House, Moon, Search, Settings, ShieldCheck, ShoppingBag, Sparkles, Sun, UserRound, X } from 'lucide-react';
import { storage } from '@/lib/storage';

export const Button = ({ className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) => (
  <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${variant === 'primary' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:-translate-y-0.5' : variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/75' : variant === 'danger' ? 'bg-destructive/10 text-destructive hover:bg-destructive/15' : 'text-muted-foreground hover:bg-muted hover:text-foreground'} ${className}`} {...props} />
);

export const Field = ({ label, hint, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) => (
  <label className={`block space-y-1.5 ${className}`}>
    {label && <span className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</span>}
    <input className="w-full rounded-xl border border-input bg-background/75 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15" {...props} />
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </label>
);

export const TextArea = ({ label, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) => (
  <label className={`block space-y-1.5 ${className}`}>
    {label && <span className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</span>}
    <textarea className="min-h-28 w-full resize-y rounded-xl border border-input bg-background/75 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15" {...props} />
  </label>
);

export const Card = ({ children, className = '', ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) => <div className={`rounded-2xl border border-card-border bg-card text-card-foreground shadow-sm ${className}`} {...props}>{children}</div>;
export const SectionTitle = ({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) => <div className="mb-5 flex items-end justify-between gap-4"><div>{eyebrow && <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</div>}<h2 className="font-serif text-2xl font-extrabold tracking-tight">{title}</h2>{detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}</div>{action}</div>;
export const DemoPill = ({ demo = false }: { demo?: boolean }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${demo ? 'bg-accent/15 text-accent-foreground' : 'bg-primary/12 text-primary'}`}><Sparkles size={12} /> {demo ? 'Fallback mode' : 'Live AI'}</span>;
export const EmptyState = ({ icon: Icon = Compass, title, detail, action }: { icon?: typeof Compass; title: string; detail: string; action?: ReactNode }) => <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center"><div className="mb-3 rounded-2xl bg-secondary p-3 text-primary"><Icon size={22} /></div><h3 className="font-serif text-lg font-bold">{title}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>{action && <div className="mt-4">{action}</div>}</div>;

const nav = [
  { href: '/', label: 'Overview', icon: House },
  { href: '/market', label: 'Market sense', icon: ShoppingBag },
  { href: '/study', label: 'Study room', icon: BookOpen },
  { href: '/assistant', label: 'Ask anything', icon: Bot },
  { href: '/safehelp', label: 'SafeHelp', icon: ShieldCheck },
];
const utility = [
  { href: '/history', label: 'Timeline', icon: History },
  { href: '/favorites', label: 'Saved', icon: Heart },
];
const mobileNav = nav;

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => storage.preferences().theme);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  const changeTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); storage.savePreferences({ ...storage.preferences(), theme: next }); };
  const NavLink = ({ item }: { item: typeof nav[number] }) => { const Icon = item.icon; return <Link data-testid={`link-${item.label.toLowerCase().replaceAll(' ', '-')}`} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${location === item.href ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{location === item.href && <ChevronRight size={14} className="ml-auto" />}</Link>; };
  return <div className="grain min-h-[100dvh] overflow-x-hidden bg-background text-foreground"><aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(16rem,calc(100vw-1rem))] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex items-center justify-between px-2"><Link href="/" data-testid="link-brand" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Compass size={20} /></span><span><span className="block font-serif text-lg font-extrabold leading-none">LifeHub</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-widest text-sidebar-foreground/50">your thinking space</span></span></Link><button data-testid="button-close-menu" onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-sidebar-foreground/60 md:hidden"><X size={18} /></button></div>
    <div className="my-8 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3"><div className="flex items-start gap-2"><span className="mt-0.5 text-sidebar-primary"><Sparkles size={15} /></span><div><p className="text-xs font-bold">A little more capable</p><p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/55">Your private cockpit for decisions, learning, and next steps.</p></div></div></div>
    <nav className="space-y-1">{nav.map((item) => <NavLink key={item.href} item={item} />)}</nav><div className="my-6 h-px bg-sidebar-border" /><p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/35">Your space</p><nav className="space-y-1">{utility.map((item) => <NavLink key={item.href} item={item} />)}</nav>
    <div className="mt-auto space-y-1"><NavLink item={{ href: '/settings', label: 'Settings', icon: Settings }} /><NavLink item={{ href: '/profile', label: 'Profile', icon: UserRound }} /><div className="mt-4 flex items-center gap-3 rounded-xl border border-sidebar-border p-3"><div className="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">MN</div><div className="min-w-0"><p className="truncate text-xs font-bold">Mira Novak</p><p className="font-mono text-[9px] text-sidebar-foreground/45">demo account</p></div></div></div>
  </aside>{mobileOpen && <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-sidebar/30 backdrop-blur-[2px] md:hidden" />}{<main className="min-h-[100dvh] pb-24 md:pl-64 md:pb-0"><header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-5 md:px-9"><div className="flex min-w-0 items-center gap-3"><button aria-label="Open navigation" data-testid="button-open-menu" onClick={() => setMobileOpen(true)} className="rounded-xl bg-secondary p-2.5 md:hidden"><Compass size={18} /></button><div className="hidden items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground sm:flex"><Search size={14} /><span>Search your hub</span><kbd className="ml-8 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd></div><span className="truncate text-xs text-muted-foreground sm:hidden">Your thinking space</span></div><div className="flex shrink-0 items-center gap-1 sm:gap-2"><button aria-label="Toggle theme" data-testid="button-theme-toggle" onClick={changeTheme} className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button><button aria-label="Open settings and notifications" data-testid="button-notifications" onClick={() => setLocation('/settings')} className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" /></button><Link href="/profile" aria-label="Open profile" data-testid="link-header-profile" className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">MN</Link></div></header><div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-5 sm:py-7 md:px-9 lg:px-12">{children}</div></main>}<nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border/80 bg-background/95 px-2 pt-2 shadow-[0_-10px_30px_hsl(220_25%_12%_/_0.08)] backdrop-blur-xl pb-[calc(.5rem+env(safe-area-inset-bottom))] md:hidden">{mobileNav.map((item) => { const Icon = item.icon; const active = location === item.href; return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} aria-label={item.label} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold ${active ? 'bg-primary/12 text-primary' : 'text-muted-foreground'}`}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span className="max-w-full truncate">{item.label}</span></Link>; })}</nav></div>;
}

export const Skeleton = ({ className = '' }: { className?: string }) => <div className={`skeleton rounded-xl ${className}`} />;
