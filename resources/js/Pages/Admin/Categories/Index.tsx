import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';

export default function Index({ categories }: { categories: any }) {
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            router.delete(route('dashboard.categories.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Catégories
                    </h2>
                    <Link href={route('dashboard.categories.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle catégorie
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Gestion des catégories" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Image</TableHead>
                                        <TableHead>Nom (FR)</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Ordre</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.data.map((category: any) => (
                                        <TableRow key={category.id}>
                                            <TableCell>
                                                {category.image ? (
                                                    <img 
                                                        src={category.image} 
                                                        alt={category.name_fr} 
                                                        className="h-10 w-16 object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{category.name_fr}</TableCell>
                                            <TableCell>{category.slug}</TableCell>
                                            <TableCell>{category.order}</TableCell>
                                            <TableCell>
                                                <Badge variant={category.published ? 'default' : 'secondary'}>
                                                    {category.published ? 'Publié' : 'Brouillon'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('dashboard.categories.edit', category.id)}>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6">
                                <Pagination links={categories.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
