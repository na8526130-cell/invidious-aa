import React, { useState, useEffect } from 'react';
import { WatchHistoryItem, UserPreferences } from '../types';
import { getHistory, removeFromHistory, clearHistory } from '../utils/storage';
import { VideoCard } from './VideoCard';
import { Clock, Trash2, ShieldAlert } from 'lucide-react';

interface HistoryViewProps {
  preferences: UserPreferences;
  onSelectVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  preferences,
  onSelectVideo,
  onSelectChannel,
}) => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleRemove = (videoId: string) => {
    removeFromHistory(videoId);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all watch history from this browser?')) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Watch History</h1>
            <p className="text-xs text-zinc-400">
              Locally stored playback logs, private to your browser
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/30 text-xs font-semibold text-zinc-300 hover:text-red-400 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Entire History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No watch history</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Videos you watch will appear here for easy resumption.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.video.videoId}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900/60 transition group"
            >
              <div className="flex-1 min-w-0">
                <VideoCard
                  video={item.video}
                  thinMode={true}
                  onSelectVideo={onSelectVideo}
                  onSelectChannel={onSelectChannel}
                />
              </div>
              <button
                onClick={() => handleRemove(item.video.videoId)}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition shrink-0 ml-3"
                title="Remove from history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
