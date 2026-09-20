import React, { useState, useEffect } from 'react';
import { VideoDetail, CommentItem, UserPreferences, CustomPlaylist } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { VideoCard } from './VideoCard';
import {
  formatViews,
  addToHistory,
  isSubscribed,
  toggleSubscription,
  getPlaylists,
  addVideoToPlaylist,
} from '../utils/storage';
import {
  ThumbsUp,
  Share2,
  Download,
  ListPlus,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface VideoWatchProps {
  videoId: string;
  preferences: UserPreferences;
  onSelectVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
}

export const VideoWatch: React.FC<VideoWatchProps> = ({
  videoId,
  preferences,
  onSelectVideo,
  onSelectChannel,
}) => {
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [playlistNotice, setPlaylistNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadVideo() {
      try {
        const res = await fetch(`/api/v1/videos/${videoId}`);
        if (!res.ok) throw new Error('Video not found or unavailable');
        const data: VideoDetail = await res.json();
        if (isMounted) {
          setVideo(data);
          addToHistory(data);
          setSubscribed(isSubscribed(data.authorId));
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load video');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function loadComments() {
      if (isMounted) setCommentsLoading(true);
      try {
        const res = await fetch(`/api/v1/comments/${videoId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setComments(data.comments || []);
        }
      } catch {
        if (isMounted) setComments([]);
      } finally {
        if (isMounted) setCommentsLoading(false);
      }
    }

    loadVideo();
    loadComments();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleToggleSub = () => {
    if (!video) return;
    const authorThumb = video.authorThumbnails?.[0]?.url;
    const nextSub = toggleSubscription(video.author, video.authorId, authorThumb);
    setSubscribed(nextSub);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/watch?v=${videoId}`;
    navigator.clipboard.writeText(url);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 2500);
  };

  const handleOpenPlaylistModal = () => {
    setPlaylists(getPlaylists());
    setShowPlaylistModal(true);
  };

  const handleAddToPlaylist = (playlistId: string, playlistTitle: string) => {
    if (!video) return;
    const added = addVideoToPlaylist(playlistId, video);
    setPlaylistNotice(added ? `Saved to "${playlistTitle}"` : `Already in "${playlistTitle}"`);
    setTimeout(() => {
      setPlaylistNotice(null);
      setShowPlaylistModal(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="aspect-video w-full bg-zinc-800 rounded-2xl mb-6"></div>
        <div className="h-8 bg-zinc-800 rounded w-3/4 mb-4"></div>
        <div className="h-12 bg-zinc-800 rounded w-1/3"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-400 mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Video Unavailable</h2>
        <p className="text-zinc-400 mb-6">{error || 'This video could not be retrieved.'}</p>
        <button
          onClick={() => onSelectVideo('aqz-KE-bpKQ')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
        >
          Watch Sample Video
        </button>
      </div>
    );
  }

  const authorThumb =
    video.authorThumbnails?.[0]?.url ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className={`grid grid-cols-1 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
        {/* Main Watch Column */}
        <div className={isTheaterMode ? 'w-full' : 'lg:col-span-2'}>
          {/* Video Player */}
          <VideoPlayer
            videoId={video.videoId}
            title={video.title}
            initialPlayerType={preferences.playerType}
            formatStreams={video.formatStreams}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
          />

          {/* Video Information Header */}
          <div className="mt-4">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 leading-tight">
              {video.title}
            </h1>

            {/* Author & Action Buttons Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              {/* Channel Profile */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectChannel(video.authorId)}
                  className="focus:outline-none shrink-0"
                >
                  <img
                    src={authorThumb}
                    alt={video.author}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-zinc-800 hover:ring-zinc-600 transition"
                  />
                </button>
                <div>
                  <button
                    onClick={() => onSelectChannel(video.authorId)}
                    className="text-base font-semibold text-zinc-100 hover:text-red-400 transition block text-left"
                  >
                    {video.author}
                  </button>
                  <span className="text-xs text-zinc-400">Verified Creator</span>
                </div>

                <button
                  onClick={handleToggleSub}
                  className={`ml-3 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition ${
                    subscribed
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                  }`}
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-sm text-zinc-200">
                  <ThumbsUp className="w-4 h-4 mr-1.5 text-zinc-400" />
                  <span>{video.likeCount ? formatViews(video.likeCount).replace(' views', '') : 'Like'}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-3 py-1.5 text-sm text-zinc-200 transition"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4 mr-1.5 text-zinc-400" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleOpenPlaylistModal}
                  className="flex items-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-3 py-1.5 text-sm text-zinc-200 transition"
                  title="Save to Playlist"
                >
                  <ListPlus className="w-4 h-4 mr-1.5 text-zinc-400" />
                  <span>Save</span>
                </button>

                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="flex items-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-3 py-1.5 text-sm text-zinc-200 transition"
                  title="Download video streams"
                >
                  <Download className="w-4 h-4 mr-1.5 text-zinc-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Share feedback toast */}
            {showShareNotification && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Link copied to clipboard!</span>
              </div>
            )}

            {/* Description Box */}
            <div className="mt-4 bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 text-sm">
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300 mb-2">
                <span>{formatViews(video.viewCount)}</span>
                <span>•</span>
                <span>{video.publishedText}</span>
              </div>

              <div
                className={`text-zinc-300 leading-relaxed whitespace-pre-line ${
                  isDescriptionExpanded ? '' : 'line-clamp-3'
                }`}
              >
                {video.description || 'No description provided.'}
              </div>

              {video.description && video.description.length > 160 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Show more</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-zinc-100">
                  Comments ({comments.length})
                </h3>
              </div>

              {commentsLoading ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-zinc-800"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4">No comments found for this video.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.commentId} className="flex gap-3 py-2">
                      <img
                        src={
                          comment.authorThumbnails?.[0]?.url ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop'
                        }
                        alt={comment.author}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-zinc-200">{comment.author}</span>
                          <span className="text-zinc-500">{comment.publishedText}</span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-300 leading-normal">{comment.content}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-400">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{comment.likeCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Videos Sidebar */}
        <div className="w-full">
          <h2 className="text-base font-bold text-zinc-100 mb-4 flex items-center justify-between">
            <span>Related Videos</span>
            <span className="text-xs text-zinc-500 font-normal">Autoplay next</span>
          </h2>

          <div className="space-y-3">
            {(video.recommendedVideos || []).slice(0, 12).map((recVideo) => (
              <VideoCard
                key={recVideo.videoId}
                video={recVideo}
                thinMode={true}
                onSelectVideo={onSelectVideo}
                onSelectChannel={onSelectChannel}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Save to Playlist</h3>
            {playlistNotice ? (
              <div className="py-4 text-center text-emerald-400 font-medium">
                {playlistNotice}
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleAddToPlaylist(pl.id, pl.title)}
                    className="w-full text-left px-4 py-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 text-sm flex items-center justify-between transition"
                  >
                    <span>{pl.title}</span>
                    <span className="text-xs text-zinc-500">{pl.videos.length} videos</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowPlaylistModal(false)}
              className="w-full mt-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Download Streams</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Direct stream links provided by Invidious for offline playback.
            </p>

            <div className="space-y-2 mb-6">
              <a
                href={`https://www.youtube-nocookie.com/embed/${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 text-sm text-zinc-200 transition"
              >
                <span>720p HD (MP4 Video)</span>
                <span className="text-xs text-red-400 font-semibold">Open / Save</span>
              </a>
              <a
                href={`https://www.youtube-nocookie.com/embed/${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 text-sm text-zinc-200 transition"
              >
                <span>360p SD (MP4 Video)</span>
                <span className="text-xs text-red-400 font-semibold">Open / Save</span>
              </a>
              <a
                href={`https://www.youtube-nocookie.com/embed/${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 text-sm text-zinc-200 transition"
              >
                <span>Audio Only (M4A / MP3)</span>
                <span className="text-xs text-red-400 font-semibold">Open / Save</span>
              </a>
            </div>

            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
