import React, { useState, useEffect } from 'react';
import { SearchItem, UserPreferences, ChannelSearchResult } from '../types';
import { VideoCard } from './VideoCard';
import { Search, Filter, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { formatViews } from '../utils/storage';

interface SearchViewProps {
  query: string;
  preferences: UserPreferences;
  onSelectVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  preferences,
  onSelectVideo,
  onSelectChannel,
}) => {
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function doSearch() {
      try {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          sort_by: sortBy,
          type: filterType,
        });

        const res = await fetch(`/api/v1/search?${params.toString()}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        if (isMounted) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (query) {
      doSearch();
    }

    return () => {
      isMounted = false;
    };
  }, [query, page, sortBy, filterType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-red-500" />
            <span>Results for "{query}"</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Page {page}</p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Options Bar */}
      {showFilters && (
        <div className="mt-4 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-300 block mb-1.5">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md p-2 focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="upload_date">Upload date</option>
              <option value="view_count">View count</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-zinc-300 block mb-1.5">Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md p-2 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="video">Video</option>
              <option value="channel">Channel</option>
              <option value="playlist">Playlist</option>
            </select>
          </div>
        </div>
      )}

      {/* Search Results List */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex gap-4 p-3 animate-pulse bg-zinc-900/40 rounded-xl">
                <div className="w-48 aspect-video bg-zinc-800 rounded-lg shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-5 bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-300">No results found</h3>
            <p className="text-xs text-zinc-500 mt-1">Try another search term or remove filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item, idx) => {
              // If item is a channel result
              if (item.type === 'channel') {
                const channel = item as ChannelSearchResult;
                const thumb = channel.authorThumbnails?.[0]?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
                return (
                  <div
                    key={`ch-${idx}`}
                    onClick={() => onSelectChannel(channel.authorId)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition group"
                  >
                    <img
                      src={thumb}
                      alt={channel.author}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-red-500 transition shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-100 group-hover:text-red-400 transition">
                          {channel.author}
                        </h3>
                        <UserCheck className="w-4 h-4 text-zinc-400" />
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {formatViews(channel.subCount).replace(' views', '')} subscribers • {channel.videoCount || 0} videos
                      </p>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {channel.description || 'Verified YouTube Channel on Invidious.'}
                      </p>
                    </div>
                  </div>
                );
              }

              // Video card in search
              const videoItem = item as any;
              return (
                <VideoCard
                  key={`vid-${videoItem.videoId || idx}`}
                  video={videoItem}
                  thinMode={true}
                  onSelectVideo={onSelectVideo}
                  onSelectChannel={onSelectChannel}
                />
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && results.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-semibold text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="text-xs text-zinc-400 font-medium">Page {page}</span>
            <button
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
