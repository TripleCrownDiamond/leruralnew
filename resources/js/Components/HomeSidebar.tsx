import { Button } from '@/Components/ui/button';
import MarketWidget from '@/Components/MarketWidget';
import WeatherWidget from '@/Components/WeatherWidget';
import { usePage, router, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import AdSpace from '@/Components/AdSpace';
import { MessageSquare, Play } from 'lucide-react';
import ImageWithFallback from '@/Components/ImageWithFallback';

const PollWidget = ({ poll }: { poll: any }) => {
    const [voted, setVoted] = useState(poll.user_has_voted);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [pollProcessing, setPollProcessing] = useState(false);

    React.useEffect(() => {
        setVoted(poll.user_has_voted);
    }, [poll]);

    const handleVote = () => {
        if (selectedOption && poll) {
            router.post(
                `/polls/${poll.id}/vote`,
                { option_id: selectedOption },
                {
                    preserveScroll: true,
                    onStart: () => setPollProcessing(true),
                    onFinish: () => setPollProcessing(false),
                    onSuccess: () => setVoted(true),
                }
            );
        }
    };

    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="h-5 w-1.5 rounded-full bg-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                    Sondage
                </h3>
            </div>
            <div className="space-y-4">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {poll.question}
                </p>
                {!voted ? (
                    <div className="space-y-3">
                        {poll.options.map((option: any) => (
                            <label
                                key={option.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-all hover:shadow-sm ${
                                    selectedOption === option.id
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-gray-200 bg-gray-50 hover:border-primary/30 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`poll_option_${poll.id}`}
                                    value={option.id}
                                    checked={selectedOption === option.id}
                                    onChange={() => setSelectedOption(option.id)}
                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{option.label}</span>
                            </label>
                        ))}
                        <Button 
                            className="w-full mt-2 font-bold" 
                            onClick={handleVote} 
                            disabled={!selectedOption || pollProcessing}
                        >
                            {pollProcessing ? 'Envoi...' : 'Voter'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {poll.options.map((option: any) => {
                            const totalVotes = poll.options.reduce((acc: number, curr: any) => acc + curr.votes, 0);
                            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                            
                            return (
                                <div key={option.id} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                                        <span>{option.label}</span>
                                        <span>{percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                        <div 
                                            className="h-full bg-primary transition-all duration-500 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">Merci pour votre vote !</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function HomeSidebar({
    marketPrices,
    webtvVideos,
    partners,
    comments,
}: {
    marketPrices?: any[];
    webtvVideos?: any[];
    partners?: any[];
    comments?: any[];
}) {
    const { props } = usePage<any>();
    const widgets = props.widgets ?? {};
    // Backward compatibility: use widgets.polls if available (array), otherwise fallback to widgets.poll (single object) wrapped in array if exists
    const polls = widgets.polls || (widgets.poll ? [widgets.poll] : []);
    
    // Newsletter form
    const { 
        data: newsletterData, 
        setData: setNewsletterData, 
        post: postNewsletter, 
        processing: newsletterProcessing, 
        reset: resetNewsletter, 
        wasSuccessful: newsletterSuccess 
    } = useForm({
        email: '',
    });

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postNewsletter('/newsletter', {
            preserveScroll: true,
            onSuccess: () => {
                resetNewsletter();
            },
        });
    };

    return (
        <aside className="sticky top-24 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
            {/* Ad Space Top Sidebar */}
            <div className="w-full flex justify-center overflow-hidden">
                <AdSpace 
                    width={300} 
                    height={250} 
                    locationId="sidebar_top" 
                    className="rounded-lg shadow-sm"
                />
            </div>

            {/* Poll Widgets */}
            {polls.length > 0 && (
                <div className="space-y-6">
                    {polls.map((poll: any) => (
                        <PollWidget key={poll.id} poll={poll} />
                    ))}
                </div>
            )}

            {/* Market Prices Widget */}
            <MarketWidget prices={marketPrices} />

            {/* Nos Émissions (WebTV Highlight) */}
            {webtvVideos && webtvVideos.length > 0 && (
                <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-1.5 rounded-full bg-red-600" />
                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                                Nos Émissions
                            </h3>
                        </div>
                        <Link href="/webtv" className="text-xs font-medium text-red-600 hover:text-red-700">
                            Voir tout
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {webtvVideos.slice(0, 3).map((video: any) => (
                            <a 
                                key={video.youtube_id}
                                href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex gap-3"
                            >
                                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <ImageWithFallback 
                                        src={video.thumbnail || `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                                        alt={video.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Play className="h-4 w-4 text-white fill-current" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="line-clamp-2 text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-red-600 transition-colors">
                                        {video.title}
                                    </h4>
                                    {video.emission_name && (
                                        <span className="mt-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                            {video.emission_name}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Weather Widget */}
            <WeatherWidget />

            {/* Ad Space Middle Sidebar */}
            <div className="w-full flex justify-center overflow-hidden my-8">
                <AdSpace 
                    width={300} 
                    height={600} 
                    locationId="sidebar_middle_skyscraper" 
                    label="Skyscraper Pub"
                    className="rounded-lg shadow-sm"
                />
            </div>

            {/* Newsletter Widget */}
            <div className="w-full rounded-xl bg-primary p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-black/10 blur-2xl"></div>
                
                <div className="relative z-10">
                    <h3 className="mb-2 text-lg font-bold uppercase tracking-wide">
                        Newsletter
                    </h3>
                    <p className="mb-4 text-sm text-primary-foreground/90">
                        Restez informé des dernières actualités agricoles.
                    </p>
                    {newsletterSuccess ? (
                        <div className="rounded-lg bg-white/20 p-3 text-center text-sm font-medium backdrop-blur-sm">
                            Merci de votre inscription !
                        </div>
                    ) : (
                        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Votre email"
                                required
                                value={newsletterData.email}
                                onChange={(e) => setNewsletterData('email', e.target.value)}
                                className="w-full rounded-lg border-0 bg-white/10 px-4 py-2 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                            />
                            <button
                                type="submit"
                                disabled={newsletterProcessing}
                                className="w-full rounded-lg bg-white px-4 py-2 text-sm font-bold text-primary transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                            >
                                {newsletterProcessing ? 'Inscription...' : "S'inscrire"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </aside>
    );
}
