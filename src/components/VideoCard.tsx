import React from 'react';
import { VideoItem } from '../types';
import { formatDuration, formatViews } from '../utils/storage';
import { Clock } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  thinMode?: boolean;
  onSelectVideo: (videoId: string) => void;
  onSelectChannel?: (channelId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  thinMode = false,
  onSelectVideo,
  onSelectChannel,
}) => {
  const thumbnail =
    video.videoThumbnails?.find((t) => t.quality === 'maxres' || t.quality === 'medium')
      ?.url ||
    video.videoThumbnails?.[0]?.url ||
    `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;

  const authorThumbnail =
    video.authorThumbnails?.[0]?.url ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop';

  if (thinMode) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/40 transition group cursor-pointer border border-transparent hover:border-zinc-800">
        <div
          className="relative w-36 sm:w-44 aspect-video bg-zinc-900 rounded overflow-hidden shrink-0"
          onClick={() => onSelectVideo(video.videoId)}
        >
          <img
            src={thumbnail}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {video.lengthSeconds > 0 && (
            <span className="absolute bottom-1 right-1 bg-black/85 text-[11px] font-semibold text-white px-1.5 py-0.5 rounded">
              {formatDuration(video.lengthSeconds)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onSelectVideo(video.videoId)}
            className="text-sm font-medium text-zinc-100 line-clamp-2 group-hover:text-red-400 transition"
            title={video.title}
          >
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectChannel) onSelectChannel(video.authorId);
              }}
              className="hover:text-zinc-200 transition"
            >
              {video.author}
            </span>
            <span>•</span>
            <span>{formatViews(video.viewCount)}</span>
            <span>•</span>
            <span>{video.publishedText}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col group cursor-pointer">
      {/* Thumbnail */}
      <div
        className="relative aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden shadow-sm"
        onClick={() => onSelectVideo(video.videoId)}
      >
        <img
          src={thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {video.liveNow ? (
          <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
            LIVE
          </span>
        ) : video.lengthSeconds > 0 ? (
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-zinc-100 px-1.5 py-0.5 rounded">
            {formatDuration(video.lengthSeconds)}
          </span>
        ) : null}
      </div>

      {/* Details Row */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectChannel) onSelectChannel(video.authorId);
          }}
          className="shrink-0 focus:outline-none"
        >
          <img
            src={authorThumbnail}
            alt={video.author}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-800"
          />
        </button>

        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onSelectVideo(video.videoId)}
            className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-400 transition"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectChannel) onSelectChannel(video.authorId);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition font-medium block truncate"
            >
              {video.author}
            </button>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <span>{formatViews(video.viewCount)}</span>
              <span>•</span>
              <span>{video.publishedText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
