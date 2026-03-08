import { useState } from 'react';
import { Play, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageWithFallback from '@/Components/ImageWithFallback';

type WebTvVideo = {
    title: string;
    youtube_id: string;
    thumbnail: string | null;
    emission_name: string | null;
    emission_image: string | null;
    emission_link: string | null;
    published_at: string;
    is_featured: boolean;
};

type Emission = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    playlist_url: string;
};

export default function WebTvSection({ videos, emissions = [] }: { videos: WebTvVideo[], emissions?: Emission[] }) {
    const [activeVideo, setActiveVideo] = useState<WebTvVideo | null>(
        videos.find((v) => v.is_featured) ?? videos[0] ?? null,
    );

    if (!videos || videos.length === 0) return null;

    const otherVideos = videos.filter(
        (v) => v.youtube_id !== activeVideo?.youtube_id,
    );

    return (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8 flex items-end justify-between border-b border-gray-800 pb-4">
                <div className="relative">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                        Le Rural <span className="text-red-600">TV</span>
                    </h2>
                    <div className="absolute -bottom-4 left-0 h-1 w-24 bg-red-600 rounded-full" />
                </div>
                <a
                    href="https://www.youtube.com/@leruralbenintv9989"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20"
                >
                    <span>S'abonner</span>
                    <Play className="h-4 w-4 fill-current" />
                </a>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-16">
                {/* Main Player */}
                <div className="lg:col-span-2">
                    {activeVideo ? (
                        <div className="group relative aspect-video w-full overflow-hidden rounded-[40px] bg-black shadow-2xl ring-1 ring-white/10">
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo.youtube_id}?autoplay=0&rel=0`}
                                title={activeVideo.title}
                                className="absolute inset-0 h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center rounded-[40px] bg-gray-800 text-gray-500">
                            Vidéo non disponible
                        </div>
                    )}
                    {activeVideo && (
                        <div className="mt-6">
                            <div className="mb-3 flex items-center gap-3">
                                <span className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 border border-red-500/20">
                                    {activeVideo.emission_name}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-gray-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(activeVideo.published_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold leading-tight text-white">
                                {activeVideo.title}
                            </h3>
                        </div>
                    )}
                </div>

                {/* Side Playlist */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Dernières vidéos
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {otherVideos.map((video) => (
                            <button
                                key={video.youtube_id}
                                onClick={() => setActiveVideo(video)}
                                className="group flex w-full gap-4 rounded-xl p-2 text-left transition-colors hover:bg-white/5"
                            >
                                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                                    <ImageWithFallback 
                                        src={video.thumbnail || `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                                        alt={video.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Play className="h-6 w-6 text-white fill-current" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center gap-1">
                                    <h4 className="line-clamp-2 text-sm font-semibold text-gray-200 group-hover:text-red-500 transition-colors">
                                        {video.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                        {new Date(video.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Emissions Carousel Section */}
            <div className="mt-16 border-t border-gray-800 pt-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                        Nos Émissions
                    </h3>
                    <div className="flex gap-2">
                        <button className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {emissions.map((emission) => (
                        <a 
                            key={emission.id} 
                            href={emission.playlist_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group cursor-pointer"
                        >
                            <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-800 relative mb-2 ring-1 ring-white/5 group-hover:ring-red-600/50 transition-all">
                                <ImageWithFallback 
                                    src={emission.image || undefined} 
                                    alt={emission.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                            </div>
                            <h4 className="text-center text-sm font-bold text-gray-300 group-hover:text-red-500 transition-colors uppercase tracking-wide">
                                {emission.name}
                            </h4>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
