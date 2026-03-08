import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    duration_days: number;
    is_active: boolean;
    is_featured: boolean;
}

export default function Edit({ plan }: { plan: Plan }) {
    const { data, setData, put, processing, errors } = useForm({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration_days: plan.duration_days,
        is_active: Boolean(plan.is_active),
        is_featured: Boolean(plan.is_featured),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.subscription-plans.update', plan.id));
    };

    return (
        <DashboardLayout title="Modifier le plan">
            <div className="flex items-center mb-6">
                <Link href={route('dashboard.subscription-plans.index')} className="mr-4">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le Plan : {plan.name}</h1>
            </div>

            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="name">Nom du plan</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1"
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1"
                        />
                        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="price">Prix (FCFA)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="mt-1"
                                required
                                min="0"
                            />
                            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                        </div>

                        <div>
                            <Label htmlFor="duration">Durée (jours)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={data.duration_days}
                                onChange={(e) => setData('duration_days', parseInt(e.target.value))}
                                className="mt-1"
                                required
                                min="1"
                            />
                            {errors.duration_days && <p className="text-sm text-red-500 mt-1">{errors.duration_days}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                        />
                        <Label htmlFor="is_active">Activer ce plan</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_featured"
                            checked={data.is_featured}
                            onCheckedChange={(checked) => setData('is_featured', checked as boolean)}
                        />
                        <Label htmlFor="is_featured">Mettre en avant (Populaire)</Label>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Enregistrement...' : 'Mettre à jour'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}