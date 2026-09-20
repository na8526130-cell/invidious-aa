import React, { useState, useEffect } from 'react';
import { UserPreferences, VideoItem } from '../types';
import { getSubscriptions, toggleSubscription } from '../utils/storage';
import { VideoCard } from './VideoCard';
import { FolderHeart, Users, Trash2, ArrowUpRight } from 'lucide-react';

interface SubscriptionsViewProps {
  preferences: UserPreferences;
  onSelectVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  preferences,
  onSelectVideo,
  onSelectChannel,
}) => {
  const [subs, setSubs] = useState<Array<{ author: string; authorId: string; thumbnail?: string }>>([]);
  const [feedVideos, setFeedVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getSubscriptions();
    setSubs(list);

    async function loadSubsFeed() {
      try {
        const res = await fetch('/api/v1/popular');
        if (res.ok) {
          const data = await res.json();
          setFeedVideos(Array.isArray(data) ? data : []);
        }
      } catch {
        setFeedVideos([]);
      } finally {
        setLoading(false);
      }
    }

    loadSubsFeed();
  }, []);

  const handleUnsubscribe = (author: string, authorId: string) => {
    toggleSubscription(author, authorId);
    setSubs(getSubscriptions());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Subscriptions</h1>
            <p className="text-xs text-zinc-400">
              Channels and feeds saved privately in local storage
            </p>
          </div>
        </div>
      </div>

      {/* Subscribed Channels Shelf */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <span>Subscribed Channels ({subs.length})</span>
        </h2>

        {subs.length === 0 ? (
          <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400 text-sm">
            You have not subscribed to any channels yet. Click Subscribe on any channel or video to track updates here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {subs.map((s) => (
              <div
                key={s.authorId}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition"
              >
                <div
                  onClick={() => onSelectChannel(s.authorId)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 group"
                >
                  <img
                    src={
                      s.thumbnail ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop'
                    }
                    alt={s.author}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-800 shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-sm font-semibold text-zinc-200 group-hover:text-red-400 transition block truncate">
                      {s.author}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <span>View channel</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleUnsubscribe(s.author, s.authorId)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition shrink-0 ml-2"
                  title="Unsubscribe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Feed Videos */}
      <div>
        <h2 className="text-base font-bold text-zinc-100 mb-4">Latest from Subscriptions</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-zinc-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div
            className={
              preferences.thinMode
                ? 'space-y-3'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7'
            }
          >
            {feedVideos.map((video) => (
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
    </div>
  );
};
