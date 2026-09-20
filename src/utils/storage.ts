import { UserPreferences, VideoItem, WatchHistoryItem, CustomPlaylist } from '../types';

const PREFS_KEY = 'invidious_preferences';
const SUBS_KEY = 'invidious_subscriptions';
const HISTORY_KEY = 'invidious_history';
const PLAYLISTS_KEY = 'invidious_playlists';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  playerType: 'embed',
  autoplay: true,
  defaultQuality: '720p',
  thinMode: false,
  region: 'US'
};

export function getPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}

export function getSubscriptions(): Array<{ author: string; authorId: string; thumbnail?: string }> {
  try {
    const raw = localStorage.getItem(SUBS_KEY);
    return raw ? JSON.parse(raw) : [
      { author: 'Blender', authorId: 'UCbTvG80-nQz9z9Xk9r5cWwA', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop' },
      { author: 'Computerphile', authorId: 'UC9-y-6csu5WGm29I7JiwpnA', thumbnail: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop' }
    ];
  } catch {
    return [];
  }
}

export function isSubscribed(authorId: string): boolean {
  return getSubscriptions().some(s => s.authorId === authorId);
}

export function toggleSubscription(author: string, authorId: string, thumbnail?: string): boolean {
  const subs = getSubscriptions();
  const index = subs.findIndex(s => s.authorId === authorId);
  let subscribed = false;
  if (index >= 0) {
    subs.splice(index, 1);
    subscribed = false;
  } else {
    subs.push({ author, authorId, thumbnail });
    subscribed = true;
  }
  try {
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
  } catch (e) {
    console.error('Failed to update subscriptions', e);
  }
  return subscribed;
}

export function getHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(video: VideoItem): void {
  try {
    const history = getHistory().filter(h => h.video.videoId !== video.videoId);
    history.unshift({
      video,
      watchedAt: Date.now()
    });
    // Keep last 100
    const trimmed = history.slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to add to history', e);
  }
}

export function removeFromHistory(videoId: string): void {
  try {
    const history = getHistory().filter(h => h.video.videoId !== videoId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to remove history item', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function getPlaylists(): CustomPlaylist[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    return raw ? JSON.parse(raw) : [
      { id: 'watch-later', title: 'Watch Later', createdAt: Date.now(), videos: [] },
      { id: 'favorites', title: 'Favorites', createdAt: Date.now(), videos: [] }
    ];
  } catch {
    return [];
  }
}

export function savePlaylist(playlist: CustomPlaylist): void {
  const playlists = getPlaylists();
  const idx = playlists.findIndex(p => p.id === playlist.id);
  if (idx >= 0) {
    playlists[idx] = playlist;
  } else {
    playlists.push(playlist);
  }
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    console.error('Failed to save playlist', e);
  }
}

export function addVideoToPlaylist(playlistId: string, video: VideoItem): boolean {
  const playlists = getPlaylists();
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return false;
  if (!pl.videos.some(v => v.videoId === video.videoId)) {
    pl.videos.push(video);
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch {}
    return true;
  }
  return false;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const secStr = secs < 10 ? `0${secs}` : `${secs}`;
  if (hrs > 0) {
    const minStr = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${minStr}:${secStr}`;
  }
  return `${mins}:${secStr}`;
}

export function formatViews(views: number): string {
  if (!views) return '0 views';
  if (views >= 1000000000) return `${(views / 1000000000).toFixed(1)}B views`;
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}
