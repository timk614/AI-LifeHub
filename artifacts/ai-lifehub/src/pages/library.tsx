import { type FormEvent, useMemo, useState } from 'react';
import { ArrowUpRight, BookOpen, Check, Download, Filter, Heart, History as HistoryIcon, Laptop, Moon, Search, Settings as SettingsIcon, ShieldCheck, Sun, Target, Trash2, UserRound } from 'lucide-react';
import { Link } from 'wouter';
import { Button, Card, DemoPill, EmptyState, Field, SectionTitle } from '@/components/ui-core';
import { storage, timeAgo } from '@/lib/storage';

type TimelineRow = { id: string; type: string; title: string; detail: string; createdAt: string };
const iconFor = (type: string) => type === 'market' ? Laptop : type === 'study' ? BookOpen : type === 'safehelp' ? ShieldCheck : HistoryIcon;

export function History() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');
  const rows = useMemo<TimelineRow[]>(() => [...storage.markets().map((item) => ({ id: item.id, type: 'market', title: item.title, detail: 'Market sense-check', createdAt: item.createdAt })), ...storage.studies().map((item) => ({ id: item.id, type: 'study', title: item.topic, detail: `${item.subject} · Study card`, createdAt: item.createdAt })), ...storage.chats().map((item) => ({ id: item.id, type: 'chat', title: item.title, detail: 'Assistant conversation', createdAt: item.createdAt }))].filter((item) => (type === 'all' || item.type === type) && `${item.title} ${item.detail}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'newest' ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)), [query, type, sort]);
  return <div className="animate-rise-in space-y-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary"><HistoryIcon size={13} /> Your space</div><h1 className="font-serif text-4xl font-extrabold tracking-tight">Timeline</h1><p className="mt-2 text-muted-foreground">The useful trail of questions, decisions, and practice.</p></div><DemoPill /></div><Card className="p-5"><div className="flex flex-col gap-3 md:flex-row"><label className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-muted-foreground" /><input data-testid="input-history-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your timeline" className="w-full rounded-xl border border-input bg-background/75 py-3 pl-9 pr-3 text-sm" /></label><label className="flex items-center gap-2"><Filter size={14} className="text-muted-foreground" /><select data-testid="select-history-type" value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-input bg-background/75 px-3 py-3 text-sm"><option value="all">All activity</option><option value="market">Market</option><option value="study">Study</option><option value="chat">Chats</option></select></label><select data-testid="select-history-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-input bg-background/75 px-3 py-3 text-sm"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div></Card><Card className="overflow-hidden">{rows.length ? <div className="divide-y divide-border">{rows.map((row) => { const Icon = iconFor(row.type); return <div data-testid={`row-history-${row.id}`} key={row.id} className="flex items-center gap-4 p-5 hover:bg-muted/35"><span className="rounded-xl bg-secondary p-2.5 text-primary"><Icon size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{row.title}</p><p className="mt-1 text-xs text-muted-foreground">{row.detail}</p></div><span className="font-mono text-[10px] text-muted-foreground">{timeAgo(row.createdAt)}</span><ArrowUpRight size={15} className="text-muted-foreground" /></div>})}</div> : <div className="p-6"><EmptyState icon={HistoryIcon} title="Nothing matches that search" detail="Try a broader phrase or switch back to all activity." action={<Button data-testid="button-history-clear" variant="secondary" onClick={() => { setQuery(''); setType('all'); }}>Reset filters</Button>} /></div>}</Card></div>;
}

export function Favorites() {
  const favorites = storage.favorites();
  const studies = storage.studies();
  const markets = storage.markets();
  const savedMarkets = markets.filter((item) => favorites.some((favorite) => favorite.includes((item.result as { brand?: string })?.brand ?? 'never')));
  const plans = storage.plans();
  const exercises = storage.exercises();
  return (
    <div className="animate-rise-in space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary"><Heart size={13} /> Your space</div>
        <h1 className="font-serif text-4xl font-extrabold tracking-tight">Saved for later.</h1>
        <p className="mt-2 text-muted-foreground">The decisions and ideas you chose to keep close.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionTitle eyebrow="Market reads" title="Saved decisions" />
          <div className="space-y-2">
            {savedMarkets.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/45 p-3"><span className="rounded-xl bg-primary/10 p-2 text-primary"><Laptop size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.title}</p><p className="text-xs text-muted-foreground">{item.currency} {item.price}</p></div><Heart size={14} className="fill-accent text-accent" /></div>)}
            {!savedMarkets.length && <EmptyState icon={Heart} title="No saved decisions yet" detail="Save a market read when the context feels worth returning to." action={<Link href="/market" data-testid="link-favorites-market" className="text-sm font-bold text-primary">Explore market sense <ArrowUpRight size={14} className="inline" /></Link>} />}
          </div>
        </Card>
        <Card className="p-6">
          <SectionTitle eyebrow="Study cards" title="Ideas to revisit" />
          <div className="space-y-2">
            {studies.slice(0, 5).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/45 p-3"><span className="rounded-xl bg-secondary p-2 text-primary"><BookOpen size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.topic}</p><p className="text-xs text-muted-foreground">{item.subject}</p></div><Check size={15} className="text-primary" /></div>)}
            {!studies.length && <EmptyState icon={BookOpen} title="Your study shelf is open" detail="Topics you explain will appear here for a quick return." action={<Link href="/study" data-testid="link-favorites-study" className="text-sm font-bold text-primary">Open study room <ArrowUpRight size={14} className="inline" /></Link>} />}
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <SectionTitle eyebrow="Plans & practice" title="Keep the thread going" />
        <div className="grid gap-3 md:grid-cols-2">
          {plans.slice(0, 2).map((plan) => <div data-testid={`card-saved-plan-${plan.id}`} key={plan.id} className="rounded-xl bg-secondary/60 p-4"><div className="flex items-center gap-2"><Target size={16} className="text-primary" /><p className="text-sm font-bold">{plan.title}</p></div><div className="mt-3 h-1.5 rounded-full bg-card"><div className="h-full rounded-full bg-primary" style={{ width: `${plan.progress}%` }} /></div><p className="mt-2 font-mono text-[10px] text-muted-foreground">{plan.progress}% in progress</p></div>)}
          {exercises.slice(0, 2).map((exercise) => <div data-testid={`card-saved-exercise-${exercise.id}`} key={exercise.id} className="rounded-xl border border-border p-4"><div className="flex items-center gap-2"><BookOpen size={16} className="text-accent-foreground" /><p className="text-xs font-bold uppercase tracking-wider">Practice prompt</p></div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{exercise.prompt}</p></div>)}
        </div>
      </Card>
    </div>
  );
}

export function Settings() {
  const initial = storage.preferences();
  const [theme, setTheme] = useState(initial.theme);
  const [notifications, setNotifications] = useState(initial.notifications);
  const [language, setLanguage] = useState(initial.language);
  const [cleared, setCleared] = useState(false);
  const persist = (next: Partial<typeof initial>) => { const value = { ...storage.preferences(), ...next }; storage.savePreferences(value); };
  const toggleTheme = (next: string) => { setTheme(next); persist({ theme: next }); document.documentElement.classList.toggle('dark', next === 'dark'); };
  return <div className="animate-rise-in max-w-3xl space-y-8"><div><div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary"><SettingsIcon size={13} /> Preferences</div><h1 className="font-serif text-4xl font-extrabold tracking-tight">Settings</h1><p className="mt-2 text-muted-foreground">Make the hub feel more like yours.</p></div><Card className="divide-y divide-border"><div className="p-6"><h2 className="font-serif text-xl font-extrabold">Appearance</h2><p className="mt-1 text-sm text-muted-foreground">A restful surface for longer thinking sessions.</p><div className="mt-4 flex gap-2">{[['light', Sun], ['dark', Moon]].map(([value, Icon]) => <button data-testid={`button-setting-theme-${value}`} key={String(value)} onClick={() => toggleTheme(String(value))} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold ${theme === value ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}><Icon size={15} /> {String(value)}</button>)}</div></div><div className="flex items-center justify-between gap-4 p-6"><div><h2 className="font-serif text-xl font-extrabold">Language</h2><p className="mt-1 text-sm text-muted-foreground">Choose your preferred interface language.</p></div><select data-testid="select-setting-language" value={language} onChange={(e) => { setLanguage(e.target.value); persist({ language: e.target.value }); }} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"><option>English</option><option>Українська</option><option>Polski</option></select></div><div className="flex items-center justify-between gap-4 p-6"><div><h2 className="font-serif text-xl font-extrabold">AI & privacy</h2><p className="mt-1 text-sm text-muted-foreground">Your OpenAI key is used only by the server. Local preferences, history, and saved items stay on this device.</p><div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary"><Check size={14} /> Live AI service connected</div></div><Button data-testid="button-clear-local-data" variant="danger" onClick={() => { storage.clear(); setCleared(true); }}><Trash2 size={15} /> Clear local data</Button></div></Card>{cleared && <p data-testid="status-data-cleared" className="rounded-xl bg-primary/10 p-4 text-sm font-semibold text-primary">Local LifeHub data cleared. Your fresh cockpit is ready.</p>}<Card className="flex items-start gap-3 bg-secondary/65 p-5"><ShieldCheck size={18} className="mt-0.5 text-primary" /><div><p className="text-sm font-bold">A note about AI guidance</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">AI responses are designed to help you think, not to replace qualified financial, medical, legal, or emergency support.</p></div></Card></div>;
}

export function Profile() {
  const initial = storage.profile() as { name: string; email: string; language: string };
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [saved, setSaved] = useState(false);
  const save = (event: FormEvent) => { event.preventDefault(); storage.saveProfile({ ...initial, name, email }); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const stats = { markets: storage.markets().length, studies: storage.studies().length, chats: storage.chats().length };
  return <div className="animate-rise-in max-w-3xl space-y-8"><div className="flex items-center gap-4"><div className="grid size-20 place-items-center rounded-[26px] bg-primary text-2xl font-extrabold text-primary-foreground shadow-lg shadow-primary/15">MN</div><div><div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary"><UserRound size={13} /> Your profile</div><h1 className="font-serif text-4xl font-extrabold tracking-tight">{name}</h1><p className="mt-1 text-sm text-muted-foreground">A thoughtful space, shaped by you.</p></div></div><div className="grid grid-cols-3 gap-3">{[['Market reads', stats.markets], ['Study cards', stats.studies], ['Conversations', stats.chats]].map(([label, value]) => <Card key={String(label)} className="p-4"><p className="font-serif text-2xl font-extrabold">{String(value)}</p><p className="mt-1 text-xs text-muted-foreground">{String(label)}</p></Card>)}</div><Card className="p-6"><SectionTitle eyebrow="Identity" title="A few details" detail="Only used to make this demo feel like your own." /><form onSubmit={save} className="space-y-4"><Field data-testid="input-profile-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} /><Field data-testid="input-profile-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><Button data-testid="button-save-profile" type="submit"><Check size={15} /> {saved ? 'Saved' : 'Save changes'}</Button></form></Card><Card className="flex items-center gap-3 bg-secondary/65 p-5"><Download size={18} className="text-primary" /><div><p className="text-sm font-bold">Your data stays close</p><p className="mt-1 text-xs text-muted-foreground">This demo persists preferences, history, and saved items in localStorage on this device.</p></div></Card></div>;
}