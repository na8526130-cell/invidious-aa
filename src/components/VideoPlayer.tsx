import React, { useState } from 'react';
import { Maximize2, Minimize2, Tv, Video, AlertCircle } from 'lucide-react';
import { FormatStream } from '../types';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  initialPlayerType: 'embed' | 'html5';
  formatStreams?: FormatStream[];
  isTheaterMode: boolean;
  onToggleTheater: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  initialPlayerType,
  formatStreams = [],
  isTheaterMode,
  onToggleTheater,
}) => {
  const [playerType, setPlayerType] = useState<'embed' | 'html5'>(initialPlayerType);
  const [streamError, setStreamError] = useState(false);

  // Pick direct stream if available
  const activeStream =
    formatStreams.find((s) => s.quality === '720p' || s.quality === '360p')?.url ||
    formatStreams[0]?.url;

  return (
    <div className="w-full flex flex-col bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80">
      {/* Viewport */}
      <div className={`relative w-full ${isTheaterMode ? 'aspect-[21/9] max-h-[75vh]' : 'aspect-video'} bg-black flex items-center justify-center`}>
        {playerType === 'embed' || streamError || !activeStream ? (
          <iframe
            key={videoId}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            key={videoId}
            src={activeStream}
            controls
            autoPlay
            className="w-full h-full"
            onError={() => {
              setStreamError(true);
              setPlayerType('embed');
            }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Player Utility Bar */}
      <div className="bg-zinc-900/90 px-4 py-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-300">Player:</span>
          <button
            onClick={() => {
              setPlayerType('embed');
              setStreamError(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition ${
              playerType === 'embed'
                ? 'bg-red-600/20 text-red-400 font-semibold'
                : 'hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Privacy-hardened YouTube Nocookie Embed"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Embedded (Nocookie)</span>
          </button>

          {activeStream && (
            <button
              onClick={() => {
                setPlayerType('html5');
                setStreamError(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition ${
                playerType === 'html5'
                  ? 'bg-red-600/20 text-red-400 font-semibold'
                  : 'hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Native HTML5 Video Player"
            >
              <Video className="w-3.5 h-3.5" />
              <span>HTML5 Direct Stream</span>
            </button>
          )}

          {streamError && (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Direct stream unavailable, switched to embed</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheater}
            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition"
            title={isTheaterMode ? 'Default View' : 'Theater Mode'}
          >
            {isTheaterMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Default View</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Theater Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
