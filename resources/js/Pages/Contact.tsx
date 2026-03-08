import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Contact() {
    return (
        <MainLayout title="Contact">
            <div className="container mx-auto max-w-4xl py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-foreground">Contactez-nous</h1>
                    <p className="mt-4 text-muted-foreground">
                        Une question ? Une suggestion ? N'hésitez pas à nous écrire.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-4 text-xl font-bold text-foreground">Nos Coordonnées</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Adresse</p>
                                        <p className="text-sm text-muted-foreground">
                                            Immeuble Le Rural, Cotonou, Bénin
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="mt-1 h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Téléphone</p>
                                        <p className="text-sm text-muted-foreground">+229 01 02 03 04</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="mt-1 h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">contact@lerural.bj</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.087799072462!2d2.4180!3d6.3650!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjEnNTQuMCJOIDLCsDI1JzA0LjgiRQ!5e0!3m2!1sen!2sbj!4v1620000000000!5m2!1sen!2sbj" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                        <h3 className="mb-6 text-xl font-bold text-foreground">Envoyez-nous un message</h3>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Nom</label>
                                    <input 
                                        id="name" 
                                        type="text" 
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                                        placeholder="Votre nom" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <input 
                                        id="email" 
                                        type="email" 
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                                        placeholder="votre@email.com" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium">Sujet</label>
                                <input 
                                    id="subject" 
                                    type="text" 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                                    placeholder="Sujet de votre message" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <textarea 
                                    id="message" 
                                    rows={5} 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                                    placeholder="Votre message..." 
                                />
                            </div>
                            <Button className="w-full">Envoyer le message</Button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
