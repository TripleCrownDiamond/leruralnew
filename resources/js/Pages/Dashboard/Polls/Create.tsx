import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        question: '',
        is_active: true,
        expires_at: '',
        options: [
            { label: '' },
            { label: '' }
        ]
    });

    const addOption = () => {
        setData('options', [...data.options, { label: '' }]);
    };

    const removeOption = (index: number) => {
        if (data.options.length <= 2) return;
        const newOptions = data.options.filter((_, i) => i !== index);
        // @ts-ignore
        setData('options', newOptions);
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...data.options];
        // @ts-ignore
        newOptions[index].label = value;
        setData('options', newOptions);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        post(route('dashboard.polls.store'));
    };

    return (
        <DashboardLayout title="Nouveau Sondage">
            <Head title="Nouveau Sondage" />

            <form onSubmit={submit}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Nouveau Sondage
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Créez un sondage pour interagir avec votre audience
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={route('dashboard.polls.index')}>Annuler</Link>
                        </Button>
                        <PrimaryButton disabled={processing}>
                            Créer le sondage
                        </PrimaryButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Question & Options
                            </h3>

                            {/* Question */}
                            <div>
                                <InputLabel htmlFor="question" value="Question du sondage *" />
                                <TextInput
                                    id="question"
                                    className="mt-1 block w-full text-lg"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    required
                                    placeholder="Ex: Quel sujet vous intéresse le plus ?"
                                />
                                <InputError message={errors.question} className="mt-2" />
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <InputLabel value="Options de réponse (Min. 2)" />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={addOption}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Ajouter une option
                                    </Button>
                                </div>
                                
                                <div className="space-y-3">
                                    {data.options.map((option, index) => (
                                        <div key={index} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                                            <span className="text-sm text-gray-400 font-mono w-6">{index + 1}.</span>
                                            <TextInput
                                                className="block w-full"
                                                // @ts-ignore
                                                value={option.label}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                required
                                            />
                                            {data.options.length > 2 && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => removeOption(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* @ts-ignore */}
                                {errors.options && <p className="text-sm text-red-500">{errors.options}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-6">
                        {/* Status & Visibility */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Configuration
                            </h3>
                            
                            <div>
                                <InputLabel htmlFor="expires_at" value="Date d'expiration" />
                                <TextInput
                                    id="expires_at"
                                    type="datetime-local"
                                    className="mt-1 block w-full dark:[color-scheme:dark]"
                                    value={data.expires_at}
                                    onChange={(e) => setData('expires_at', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Laissez vide pour aucune expiration</p>
                                <InputError message={errors.expires_at} className="mt-2" />
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Sondage actif</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
