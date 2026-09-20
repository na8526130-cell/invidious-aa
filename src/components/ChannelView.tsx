import React, { useState, useEffect } from 'react';
import { ChannelDetail, UserPreferences } from '../types';
import { VideoCard } from './VideoCard';
import { formatViews, isSubscribed, toggleSubscription } from '../utils/storage';
import { Check, UserCheck, Video, Info } from 'lucide-react';

interface ChannelViewProps {
  channelId: string;
  preferences: UserPreferences;
  onSelectVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
}

export const ChannelView: React.FC<ChannelViewProps> = ({
  channelId,
  preferences,
  onSelectVideo,
  onSelectChannel,
}) => {
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadChannel() {
      try {
        const res = await fetch(`/api/v1/channels/${channelId}`);
        if (!res.ok) throw new Error('Channel not found');
        const data: ChannelDetail = await res.json();
        if (isMounted) {
          setChannel(data);
          setSubscribed(isSubscribed(data.authorId));
        }
      } catch {
        if (isMounted) setChannel(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadChannel();

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  const handleToggleSub = () => {
    if (!channel) return;
    const thumb = channel.authorThumbnails?.[0]?.url;
    const nextSub = toggleSubscription(channel.author, channel.authorId, thumb);
    setSubscribed(nextSub);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-44 sm:h-64 bg-zinc-800 rounded-2xl mb-6"></div>
        <div className="flex gap-4 items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-zinc-800"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-zinc-400">
        <h2 className="text-xl font-bold text-zinc-200">Channel Unavailable</h2>
        <p className="text-sm mt-2">Could not retrieve channel details.</p>
      </div>
    );
  }

  const banner =
    channel.authorBanners?.[0]?.url ||
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=300&fit=crop';
  const avatar =
    channel.authorThumbnails?.[0]?.url ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Banner */}
      <div className="w-full h-36 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-zinc-900 shadow-md">
        <img src={banner} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={channel.author}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-zinc-950 shadow-xl shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">{channel.author}</h1>
              <UserCheck className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {formatViews(channel.subCount).replace(' views', '')} subscribers
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleSub}
          className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition ${
            subscribed
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
          }`}
        >
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      {/* Channel Tabs */}
      <div className="flex items-center gap-6 border-b border-zinc-800 my-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'videos'
              ? 'border-red-500 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videos</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'about'
              ? 'border-red-500 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' ? (
        <div className="mt-6">
          <div
            className={
              preferences.thinMode
                ? 'space-y-3'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7'
            }
          >
            {(channel.latestVideos || []).map((v) => (
              <VideoCard
                key={v.videoId}
                video={v}
                thinMode={preferences.thinMode}
                onSelectVideo={onSelectVideo}
                onSelectChannel={onSelectChannel}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 max-w-2xl bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-zinc-100 mb-3">Description</h3>
          <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
            {channel.description || 'No channel description provided.'}
          </p>

          <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-2 gap-4 text-xs text-zinc-400">
            <div>
              <span className="font-semibold block text-zinc-300">Subscribers</span>
              <span>{formatViews(channel.subCount).replace(' views', '')}</span>
            </div>
            <div>
              <span className="font-semibold block text-zinc-300">Total Views</span>
              <span>{channel.totalViews ? formatViews(channel.totalViews) : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
