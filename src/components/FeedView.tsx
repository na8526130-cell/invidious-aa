import React, { useState, useEffect } from 'react';
import { VideoItem, UserPreferences } from '../types';
import { VideoCard } from './VideoCard';
import { Flame, Music, Gamepad2, Newspaper, Film, Sparkles } from 'lucide-react';

interface FeedViewProps {
  feedType: 'trending' | 'popular';
  preferences: UserPreferences;
  onSelectVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  feedType,
  preferences,
  onSelectVideo,
  onSelectChannel,
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'all', label: 'Now', icon: Sparkles },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'movies', label: 'Movies', icon: Film },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadFeed() {
      try {
        let endpoint = '/api/v1/trending';
        if (feedType === 'popular') {
          endpoint = '/api/v1/popular';
        } else if (activeTab !== 'all') {
          endpoint = `/api/v1/trending?type=${activeTab}`;
        }

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to load feed');
        const data = await res.json();
        if (isMounted) {
          setVideos(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve feed');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, [feedType, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 capitalize">
              {feedType} Videos
            </h1>
            <p className="text-xs text-zinc-400">
              Real-time privacy-friendly YouTube stream feed
            </p>
          </div>
        </div>

        {feedType === 'trending' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
                    active
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="flex flex-col animate-pulse">
              <div className="aspect-video w-full bg-zinc-800 rounded-xl mb-3"></div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center text-zinc-400">
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="py-16 text-center text-zinc-400">
          <p>No videos available in this category.</p>
        </div>
      ) : (
        <div
          className={
            preferences.thinMode
              ? 'space-y-3'
              : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7'
          }
        >
          {videos.map((video) => (
            <VideoCard
              key={video.videoId}
              video={video}
              thinMode={preferences.thinMode}
              onSelectVideo={onSelectVideo}
              onSelectChannel={onSelectChannel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
