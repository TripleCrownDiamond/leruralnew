import { usePage } from '@inertiajs/react';

const resolveCollection = (
    pageValue?: any[] | null,
    sharedValue?: any[] | null,
): any[] => {
    if (Array.isArray(pageValue) && pageValue.length > 0) {
        return pageValue;
    }

    if (Array.isArray(sharedValue) && sharedValue.length > 0) {
        return sharedValue;
    }

    if (Array.isArray(pageValue)) {
        return pageValue;
    }

    if (Array.isArray(sharedValue)) {
        return sharedValue;
    }

    return [];
};

const resolveCollectionPreferShared = (
    sharedValue?: any[] | null,
    pageValue?: any[] | null,
): any[] => {
    if (Array.isArray(sharedValue) && sharedValue.length > 0) {
        return sharedValue;
    }

    if (Array.isArray(pageValue) && pageValue.length > 0) {
        return pageValue;
    }

    if (Array.isArray(sharedValue)) {
        return sharedValue;
    }

    if (Array.isArray(pageValue)) {
        return pageValue;
    }

    return [];
};

export default function useSharedContent() {
    const { props } = usePage<any>();
    const sharedContent = props.shared_content ?? {};

    return {
        sharedContent,
        announcements: resolveCollection(
            props.announcements,
            sharedContent.announcements,
        ),
        advertisements: sharedContent.advertisements ?? {},
        marketPrices: resolveCollection(
            props.market_prices,
            sharedContent.market_prices,
        ),
        webtvVideos: resolveCollectionPreferShared(
            sharedContent.webtv_videos,
            props.webtv_videos,
        ),
        youtubeVideos: resolveCollection(
            props.youtube_videos,
            sharedContent.youtube_videos,
        ),
        youtubePlaylists: resolveCollection(
            props.youtube_playlists,
            sharedContent.youtube_playlists,
        ),
        emissions: resolveCollectionPreferShared(
            sharedContent.emissions,
            props.emissions,
        ),
        partners: resolveCollection(props.partners, sharedContent.partners),
        latestComments: resolveCollection(
            props.latest_comments,
            sharedContent.latest_comments,
        ),
        liveStreams: resolveCollection(
            props.live_streams,
            sharedContent.live_streams,
        ),
        liveReplays: resolveCollectionPreferShared(
            sharedContent.live_replays,
            props.live_replays,
        ),
        pressPapers: resolveCollection(
            sharedContent.press_papers,
            props.press_papers,
        ),
        youtubeChannel:
            props.youtube_channel ?? sharedContent.youtube_channel ?? null,
    };
}
