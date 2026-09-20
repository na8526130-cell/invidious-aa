import React, { useState, useEffect } from 'react';
import { CustomPlaylist, UserPreferences, VideoItem } from '../types';
import { getPlaylists, savePlaylist } from '../utils/storage';
import { VideoCard } from './VideoCard';
import { ListVideo, Plus, Play, Trash2, FolderPlus } from 'lucide-react';

interface PlaylistsViewProps {
  preferences: UserPreferences;
  onSelectVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  preferences,
  onSelectVideo,
  onSelectChannel,
}) => {
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('watch-later');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const list = getPlaylists();
    setPlaylists(list);
    if (list.length > 0 && !selectedPlaylistId) {
      setSelectedPlaylistId(list[0].id);
    }
  }, []);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPl: CustomPlaylist = {
      id: `pl-${Date.now()}`,
      title: newTitle.trim(),
      createdAt: Date.now(),
      videos: [],
    };
    savePlaylist(newPl);
    const updated = getPlaylists();
    setPlaylists(updated);
    setSelectedPlaylistId(newPl.id);
    setNewTitle('');
    setShowCreateModal(false);
  };

  const handleRemoveVideo = (videoId: string) => {
    if (!selectedPlaylist) return;
    const updatedVideos = selectedPlaylist.videos.filter((v) => v.videoId !== videoId);
    const updatedPl = { ...selectedPlaylist, videos: updatedVideos };
    savePlaylist(updatedPl);
    setPlaylists(getPlaylists());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <ListVideo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Playlists</h1>
            <p className="text-xs text-zinc-400">
              Manage custom playlists saved locally in browser
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Playlist Selector Sidebar */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Your Playlists
          </h2>
          {playlists.map((pl) => {
            const active = selectedPlaylist?.id === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                  active
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <div className="truncate">
                  <span className="text-sm block truncate">{pl.title}</span>
                  <span className="text-xs text-zinc-500 font-normal">
                    {pl.videos.length} videos
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Playlist Videos */}
        <div className="lg:col-span-3">
          {selectedPlaylist ? (
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">{selectedPlaylist.title}</h2>
                  <span className="text-xs text-zinc-400">
                    {selectedPlaylist.videos.length} items
                  </span>
                </div>

                {selectedPlaylist.videos.length > 0 && (
                  <button
                    onClick={() => onSelectVideo(selectedPlaylist.videos[0].videoId)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              {selectedPlaylist.videos.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-sm">
                  This playlist is empty. Click "Save" while watching any video to add it here.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPlaylist.videos.map((video) => (
                    <div
                      key={video.videoId}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900/60 transition group"
                    >
                      <div className="flex-1 min-w-0">
                        <VideoCard
                          video={video}
                          thinMode={true}
                          onSelectVideo={onSelectVideo}
                          onSelectChannel={onSelectChannel}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveVideo(video.videoId)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition shrink-0 ml-3"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-red-500" />
              <span>Create New Playlist</span>
            </h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Science & Documentaries"
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg p-3 focus:outline-none focus:border-red-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
