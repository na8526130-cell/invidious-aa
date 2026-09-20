import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { DEFAULT_PREFERENCES } from '../utils/storage';
import { Settings, Check, RotateCcw, Server, ShieldCheck } from 'lucide-react';

interface PreferencesViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(preferences);
  const [savedNotice, setSavedNotice] = useState(false);
  const [instanceStats, setInstanceStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/stats')
      .then((r) => r.json())
      .then((data) => setInstanceStats(data))
      .catch(() => {});
  }, []);

  const handleChange = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    onUpdatePreferences(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFERENCES);
    onUpdatePreferences(DEFAULT_PREFERENCES);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Preferences</h1>
            <p className="text-xs text-zinc-400">
              Customize your Invidious viewing experience and privacy settings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 space-y-5">
          <h2 className="text-base font-bold text-zinc-100 pb-2 border-b border-zinc-800/80">
            Appearance & Layout
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-zinc-200 block mb-2">
                Theme
              </label>
              <select
                value={prefs.theme}
                onChange={(e) => handleChange('theme', e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="dark">Dark Theme (Default)</option>
                <option value="oled">OLED Black</option>
                <option value="light">Light Theme</option>
              </select>
              <p className="text-xs text-zinc-500 mt-1.5">
                Controls overall page contrast and background tones.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-200 block mb-2">
                Thin Mode
              </label>
              <select
                value={prefs.thinMode ? 'true' : 'false'}
                onChange={(e) => handleChange('thinMode', e.target.value === 'true')}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="false">Standard Visual Grid</option>
                <option value="true">Thin Compact Mode (Invidious classic)</option>
              </select>
              <p className="text-xs text-zinc-500 mt-1.5">
                Displays video items as dense horizontal list items with compact info.
              </p>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 space-y-5">
          <h2 className="text-base font-bold text-zinc-100 pb-2 border-b border-zinc-800/80">
            Playback & Player
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-zinc-200 block mb-2">
                Preferred Player
              </label>
              <select
                value={prefs.playerType}
                onChange={(e) => handleChange('playerType', e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="embed">Embedded (YouTube Nocookie - Recommended)</option>
                <option value="html5">Native HTML5 Direct Stream</option>
              </select>
              <p className="text-xs text-zinc-500 mt-1.5">
                The embedded player runs smoothly inside sandboxes with zero tracking cookies.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-200 block mb-2">
                Default Quality
              </label>
              <select
                value={prefs.defaultQuality}
                onChange={(e) => handleChange('defaultQuality', e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="1080p">1080p HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
                <option value="360p">360p SD</option>
                <option value="auto">Auto</option>
              </select>
              <p className="text-xs text-zinc-500 mt-1.5">
                Preferred resolution for stream loading.
              </p>
            </div>
          </div>
        </div>

        {/* Instance Status */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/90">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-zinc-100">Instance Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-zinc-400">
            <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
              <span className="block font-semibold text-zinc-200 mb-1">Server Platform</span>
              <span className="text-orange-400 font-semibold flex items-center gap-1">
                Cloudflare Workers
              </span>
              <span className="block text-[11px] text-zinc-500 mt-0.5">Global Edge Anycast</span>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
              <span className="block font-semibold text-zinc-200 mb-1">Server Provider</span>
              <span className="text-zinc-200 font-medium">Cloudflare, Inc.</span>
              <span className="block text-[11px] text-zinc-500 mt-0.5">Serverless Edge Network</span>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
              <span className="block font-semibold text-zinc-200 mb-1">Architecture</span>
              <span className="text-zinc-300">
                Cloudflare Worker (V8 Isolate)
              </span>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
              <span className="block font-semibold text-zinc-200 mb-1">Privacy & Protection</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Edge Proxied & Stripped
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
