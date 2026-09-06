import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarCheck, CheckCircle2, Globe2, GripVertical, Plus, RotateCcw, Save, Settings, Trash2, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton } from '@/Components/Dashboard/AdminButton';

interface Settings {
    stats: Array<{ value: string; label: string }>;
    packs: Array<{ name: string; range: string; tag: string; features: string[]; highlight: boolean }>;
    registration_tabs: Array<{ type: string; label: string; description: string; icon: string; enabled: boolean }>;
    form_options: Record<string, string[]>;
    composantes: Array<{ icon: string; title: string; text: string }>;
    page_text: Record<string, any>;
}

type Section = 'stats' | 'packs' | 'tabs' | 'options' | 'composantes' | 'text';

const SECTIONS: { key: Section; label: string; icon: ReactNode }[] = [
    { key: 'stats', label: 'Statistiques', icon: <span className="text-lg">📊</span> },
    { key: 'packs', label: 'Packs Sponsoring', icon: <span className="text-lg">🤝</span> },
    { key: 'tabs', label: 'Onglets inscription', icon: <span className="text-lg">📋</span> },
    { key: 'options', label: 'Options formulaires', icon: <span className="text-lg">📝</span> },
    { key: 'composantes', label: 'Composantes', icon: <span className="text-lg">🧩</span> },
    { key: 'text', label: 'Textes page', icon: <span className="text-lg">📄</span> },
];

export default function Index({ settings }: { settings: Settings }) {
    const { props } = usePage<any>();
    const flash = props.flash ?? {};
    const [activeSection, setActiveSection] = useState<Section>('stats');

    return (
        <DashboardLayout title="Configuration SAFEB">
            <Head title="Configuration SAFEB" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Configuration"
                    title="Parametres SAFEB 2026"
                    subtitle="Gerez le contenu, les options d'inscription et les textes de la page publique SAFEB."
                    icon={<Settings className="h-6 w-6" />}
                />

                {flash.success && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Section tabs */}
                <div className="flex flex-wrap gap-2">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.key}
                            type="button"
                            onClick={() => setActiveSection(section.key)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition-all ${
                                activeSection === section.key
                                    ? 'border-primary bg-primary text-white shadow-lg'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-white/60'
                            }`}
                        >
                            {section.icon}
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Section content */}
                <AdminCard className="p-6">
                    {activeSection === 'stats' && <StatsSection settings={settings} />}
                    {activeSection === 'packs' && <PacksSection settings={settings} />}
                    {activeSection === 'tabs' && <TabsSection settings={settings} />}
                    {activeSection === 'options' && <OptionsSection settings={settings} />}
                    {activeSection === 'composantes' && <ComposantesSection settings={settings} />}
                    {activeSection === 'text' && <TextSection settings={settings} />}
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}

/* ======================== STATS SECTION ======================== */
function StatsSection({ settings }: { settings: Settings }) {
    const [stats, setStats] = useState(settings.stats || []);
    const { post, processing } = useForm({ section: 'stats', value: stats });

    const addStat = () => setStats([...stats, { value: '', label: '' }]);
    const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));
    const updateStat = (i: number, field: 'value' | 'label', val: string) => {
        const next = [...stats];
        next[i] = { ...next[i], [field]: val };
        setStats(next);
    };

    const save = () => post(route('dashboard.safeb-settings.update'), { preserveScroll: true });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Statistiques affichees sur la page</h3>
                <div className="flex gap-2">
                    <AdminButton variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => router.post(route('dashboard.safeb-settings.reset', 'stats'), {}, { preserveScroll: true })}>Reinitialiser</AdminButton>
                    <AdminButton variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save} disabled={processing}>Enregistrer</AdminButton>
                </div>
            </div>
            <div className="space-y-3">
                {stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-gray-300" />
                        <input value={stat.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="Valeur (ex: 300)" className="h-10 w-32 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                        <input value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Libelle" className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                        <button onClick={() => removeStat(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                ))}
            </div>
            <button onClick={addStat} className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 px-4 py-2 text-xs font-bold text-gray-500 hover:border-primary hover:text-primary"><Plus className="h-3.5 w-3.5" /> Ajouter une stat</button>
        </div>
    );
}

/* ======================== PACKS SECTION ======================== */
function PacksSection({ settings }: { settings: Settings }) {
    const [packs, setPacks] = useState(settings.packs || []);
    const { post, processing } = useForm({ section: 'packs', value: packs });

    const addPack = () => setPacks([...packs, { name: '', range: '', tag: '', features: [''], highlight: false }]);
    const removePack = (i: number) => setPacks(packs.filter((_, idx) => idx !== i));
    const updatePack = (i: number, field: string, val: any) => {
        const next = [...packs];
        next[i] = { ...next[i], [field]: val };
        setPacks(next);
    };
    const addFeature = (i: number) => {
        const next = [...packs];
        next[i] = { ...next[i], features: [...next[i].features, ''] };
        setPacks(next);
    };
    const updateFeature = (pi: number, fi: number, val: string) => {
        const next = [...packs];
        const features = [...next[pi].features];
        features[fi] = val;
        next[pi] = { ...next[pi], features };
        setPacks(next);
    };
    const removeFeature = (pi: number, fi: number) => {
        const next = [...packs];
        next[pi] = { ...next[pi], features: next[pi].features.filter((_, idx) => idx !== fi) };
        setPacks(next);
    };

    const save = () => post(route('dashboard.safeb-settings.update'), { preserveScroll: true });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Packs sponsoring</h3>
                <div className="flex gap-2">
                    <AdminButton variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => router.post(route('dashboard.safeb-settings.reset', 'packs'), {}, { preserveScroll: true })}>Reinitialiser</AdminButton>
                    <AdminButton variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save} disabled={processing}>Enregistrer</AdminButton>
                </div>
            </div>
            <div className="space-y-6">
                {packs.map((pack, i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 p-4 space-y-3 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-gray-300" />
                                <input value={pack.name} onChange={(e) => updatePack(i, 'name', e.target.value)} placeholder="Nom du pack" className="h-10 w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-white/5 dark:text-white" />
                                <input value={pack.range} onChange={(e) => updatePack(i, 'range', e.target.value)} placeholder="Fourchette de prix" className="h-10 w-56 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                                <input value={pack.tag} onChange={(e) => updatePack(i, 'tag', e.target.value)} placeholder="Tag" className="h-10 w-32 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <input type="checkbox" checked={pack.highlight} onChange={(e) => updatePack(i, 'highlight', e.target.checked)} className="rounded border-gray-300" />
                                    Mis en avant
                                </label>
                                <button onClick={() => removePack(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <div className="space-y-2 pl-8">
                            {pack.features.map((feat, fi) => (
                                <div key={fi} className="flex items-center gap-2">
                                    <input value={feat} onChange={(e) => updateFeature(i, fi, e.target.value)} placeholder="Avantage" className="h-9 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white" />
                                    <button onClick={() => removeFeature(i, fi)} className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                                </div>
                            ))}
                            <button onClick={() => addFeature(i)} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"><Plus className="h-3 w-3" /> Ajouter un avantage</button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addPack} className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 px-4 py-2 text-xs font-bold text-gray-500 hover:border-primary hover:text-primary"><Plus className="h-3.5 w-3.5" /> Ajouter un pack</button>
        </div>
    );
}

/* ======================== TABS SECTION ======================== */
function TabsSection({ settings }: { settings: Settings }) {
    const [tabs, setTabs] = useState(settings.registration_tabs || []);
    const { post, processing } = useForm({ section: 'registration_tabs', value: tabs });

    const toggleEnabled = (i: number) => {
        const next = [...tabs];
        next[i] = { ...next[i], enabled: !next[i].enabled };
        setTabs(next);
    };
    const updateTab = (i: number, field: string, val: string) => {
        const next = [...tabs];
        next[i] = { ...next[i], [field]: val };
        setTabs(next);
    };

    const save = () => post(route('dashboard.safeb-settings.update'), { preserveScroll: true });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Onglets d'inscription</h3>
                <div className="flex gap-2">
                    <AdminButton variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => router.post(route('dashboard.safeb-settings.reset', 'registration_tabs'), {}, { preserveScroll: true })}>Reinitialiser</AdminButton>
                    <AdminButton variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save} disabled={processing}>Enregistrer</AdminButton>
                </div>
            </div>
            <p className="text-xs text-gray-500">Activez ou desactivez les types d'inscription disponibles sur la page publique.</p>
            <div className="space-y-3">
                {tabs.map((tab: any, i: number) => (
                    <div key={i} className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${tab.enabled ? 'border-primary/20 bg-primary/5' : 'border-gray-200 bg-gray-50 opacity-60 dark:border-white/10 dark:bg-white/[0.02]'}`}>
                        <button onClick={() => toggleEnabled(i)} className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg transition-colors ${tab.enabled ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {tab.enabled ? '✓' : '—'}
                        </button>
                        <div className="flex-1 space-y-2">
                            <div className="flex gap-3">
                                <input value={tab.label} onChange={(e) => updateTab(i, 'label', e.target.value)} placeholder="Libelle" className="h-10 w-56 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-white/5 dark:text-white" />
                                <input value={tab.icon} onChange={(e) => updateTab(i, 'icon', e.target.value)} placeholder="Icone (ex: Users)" className="h-10 w-36 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            </div>
                            <input value={tab.description} onChange={(e) => updateTab(i, 'description', e.target.value)} placeholder="Description" className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white" />
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase text-gray-500 dark:bg-white/5 dark:text-white/40">{tab.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ======================== OPTIONS SECTION ======================== */
function OptionsSection({ settings }: { settings: Settings }) {
    const [options, setOptions] = useState<Record<string, string[]>>(settings.form_options || {});
    const { post, processing } = useForm({ section: 'form_options', value: options });
    const [newKey, setNewKey] = useState('');
    const [newVal, setNewVal] = useState('');
    const [activeType, setActiveType] = useState(Object.keys(options)[0] || 'panel');

    const addOption = () => {
        if (!newVal.trim()) return;
        const next = { ...options };
        next[activeType] = [...(next[activeType] || []), newVal.trim()];
        setOptions(next);
        setNewVal('');
    };
    const removeOption = (type: string, idx: number) => {
        const next = { ...options };
        next[type] = next[type].filter((_, i) => i !== idx);
        setOptions(next);
    };
    const addType = () => {
        if (!newKey.trim()) return;
        const next = { ...options };
        next[newKey.trim()] = [];
        setOptions(next);
        setActiveType(newKey.trim());
        setNewKey('');
    };
    const removeType = (type: string) => {
        const next = { ...options };
        delete next[type];
        setOptions(next);
        if (activeType === type) setActiveType(Object.keys(next)[0] || '');
    };

    const save = () => post(route('dashboard.safeb-settings.update'), { preserveScroll: true });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Options des formulaires d'inscription</h3>
                <div className="flex gap-2">
                    <AdminButton variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => router.post(route('dashboard.safeb-settings.reset', 'form_options'), {}, { preserveScroll: true })}>Reinitialiser</AdminButton>
                    <AdminButton variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save} disabled={processing}>Enregistrer</AdminButton>
                </div>
            </div>
            <p className="text-xs text-gray-500">Gerez les choix proposes dans les listes deroulantes du formulaire d'inscription.</p>

            {/* Type selector */}
            <div className="flex flex-wrap gap-2">
                {Object.keys(options).map((type) => (
                    <button key={type} onClick={() => setActiveType(type)} className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${activeType === type ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary/30'}`}>
                        {type} ({(options[type] || []).length})
                    </button>
                ))}
                <div className="flex items-center gap-2">
                    <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Nouveau type" className="h-8 w-32 rounded-full border border-gray-200 bg-white px-3 text-[10px] dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <button onClick={addType} className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white"><Plus className="h-3.5 w-3.5" /></button>
                </div>
            </div>

            {/* Options for active type */}
            {activeType && (
                <div className="space-y-2">
                    {(options[activeType] || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-gray-300" />
                            <input value={opt} onChange={(e) => { const next = { ...options }; const arr = [...next[activeType]]; arr[i] = e.target.value; next[activeType] = arr; setOptions(next); }} className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            <button onClick={() => removeOption(activeType, i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <input value={newVal} onChange={(e) => setNewVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOption()} placeholder="Nouvelle option" className="h-10 flex-1 rounded-xl border border-dashed border-gray-300 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                        <AdminButton variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={addOption}>Ajouter</AdminButton>
                    </div>
                    <button onClick={() => removeType(activeType)} className="text-[10px] font-bold text-red-500 hover:underline">Supprimer ce type</button>
                </div>
            )}
        </div>
    );
}

/* ======================== COMPOSANTES SECTION ======================== */
function ComposantesSection({ settings }: { settings: Settings }) {
    const [composantes, setComposantes] = useState(settings.composantes || []);
    const { post, processing } = useForm({ section: 'composantes', value: composantes });

    const add = () => setComposantes([...composantes, { icon: 'Store', title: '', text: '' }]);
    const remove = (i: number) => setComposantes(composantes.filter((_, idx) => idx !== i));
    const update = (i: number, field: string, val: string) => {
        const next = [...composantes];
        next[i] = { ...next[i], [field]: val };
        setComposantes(next);
    };

    const save = () => post(route('dashboard.safeb-settings.update'), { preserveScroll: true });

    const ICON_OPTIONS = ['Store', 'Mic2', 'Presentation', 'Award', 'Film', 'Handshake', 'Globe2', 'Ticket', 'Users', 'Video'];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Composantes du projet</h3>
                <div className="flex gap-2">
                    <AdminButton variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => router.post(route('dashboard.safeb-settings.reset', 'composantes'), {}, { preserveScroll: true })}>Reinitialiser</AdminButton>
                    <AdminButton variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save} disabled={processing}>Enregistrer</AdminButton>
                </div>
            </div>
            <div className="space-y-4">
                {composantes.map((comp, i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 p-4 space-y-3 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-gray-300" />
                                <select value={comp.icon} onChange={(e) => update(i, 'icon', e.target.value)} className="h-10 w-36 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                                <input value={comp.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Titre" className="h-10 w-64 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            </div>
                            <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <textarea value={comp.text} onChange={(e) => update(i, 'text', e.target.value)} placeholder="Description" rows={2} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    </div>
                ))}
            </div>
            <button onClick={add} className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 px-4 py-2 text-xs font-bold text-gray-500 hover:border-primary hover:text-primary"><Plus className="h-3.5 w-3.5" /> Ajouter une composante</button>
        </div>
    );
}

/* ======================== TEXT SECTION ======================== */
function TextSection({ settings }: { settings: Settings }) {
    const [text, setText] = useState(settings.page_text || {});
    const { post, processing } = useForm({ section: 'page_text', value: text });

    const update = (field: string, val: string) => setText({ ...text, [field]: val });

    const save = () => post(route('dashboard.safeb-settings.update'), { preserveScroll: true });

    const fields = [
        { key: 'context_title', label: 'Titre section Contexte', type: 'text' },
        { key: 'context_body', label: 'Texte Contexte (paragraphe 1)', type: 'textarea' },
        { key: 'context_body_2', label: 'Texte Contexte (paragraphe 2)', type: 'textarea' },
        { key: 'objectives_title', label: 'Titre section Objectifs', type: 'text' },
        { key: 'contact_phone', label: 'Telephone de contact', type: 'text' },
        { key: 'contact_email', label: 'Email de contact', type: 'text' },
        { key: 'contact_address', label: 'Adresse de contact', type: 'text' },
        { key: 'cta_title', label: 'Titre footer CTA', type: 'text' },
        { key: 'cta_body', label: 'Texte footer CTA', type: 'textarea' },
        { key: 'cta_footer', label: 'Sous-titre footer', type: 'text' },
    ];

    // Objectives list management
    const objectives: string[] = text.objectives || [];
    const addObjective = () => setText({ ...text, objectives: [...objectives, ''] });
    const updateObjective = (i: number, val: string) => {
        const next = [...objectives];
        next[i] = val;
        setText({ ...text, objectives: next });
    };
    const removeObjective = (i: number) => setText({ ...text, objectives: objectives.filter((_, idx) => idx !== i) });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Textes de la page publique</h3>
                <div className="flex gap-2">
                    <AdminButton variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => router.post(route('dashboard.safeb-settings.reset', 'page_text'), {}, { preserveScroll: true })}>Reinitialiser</AdminButton>
                    <AdminButton variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save} disabled={processing}>Enregistrer</AdminButton>
                </div>
            </div>

            <div className="space-y-4">
                {fields.map((field) => (
                    <label key={field.key} className="block">
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{field.label}</span>
                        {field.type === 'textarea' ? (
                            <textarea value={text[field.key] || ''} onChange={(e) => update(field.key, e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                        ) : (
                            <input type="text" value={text[field.key] || ''} onChange={(e) => update(field.key, e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                        )}
                    </label>
                ))}

                {/* Objectives list */}
                <label className="block">
                    <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Objectifs</span>
                    <div className="space-y-2">
                        {objectives.map((obj, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input value={obj} onChange={(e) => updateObjective(i, e.target.value)} className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
                                <button onClick={() => removeObjective(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        ))}
                        <button onClick={addObjective} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"><Plus className="h-3 w-3" /> Ajouter un objectif</button>
                    </div>
                </label>
            </div>
        </div>
    );
}
