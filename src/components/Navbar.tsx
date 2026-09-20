import React, { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Settings, Flame, TrendingUp, Clock, ListVideo, FolderHeart, X } from 'lucide-react';
import { UserPreferences } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  preferences,
  onUpdatePreferences,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const query = term !== undefined ? term : searchQuery;
    if (query.trim()) {
      setShowSuggestions(false);
      onNavigate('search', query.trim());
    }
  };

  const cycleTheme = () => {
    const nextTheme: Record<string, UserPreferences['theme']> = {
      dark: 'light',
      light: 'oled',
      oled: 'dark',
    };
    onUpdatePreferences({
      ...preferences,
      theme: nextTheme[preferences.theme] || 'dark',
    });
  };

  const navItemClass = (view: string) => {
    const active = currentView === view;
    return `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
      active
        ? 'bg-red-600/15 text-red-500 font-semibold'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 backdrop-blur-md bg-zinc-950/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('trending')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="Invidious Home"
          >
            <img
              src="/assets/invidious-colored-vector.svg"
              alt="Invidious"
              className="w-8 h-8 group-hover:scale-105 transition-transform"
              onError={(e) => {
                // Fallback SVG if asset fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-red-500 transition-colors">
                Invidious
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
                Lightweight & Private
              </span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search videos, channels, playlists..."
              className="w-full bg-zinc-900/90 border border-zinc-700/70 text-zinc-100 placeholder-zinc-500 text-sm rounded-l-full py-2 pl-4 pr-9 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-14 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 border border-l-0 border-zinc-700/70 text-zinc-300 hover:text-zinc-100 px-5 py-2 rounded-r-full flex items-center justify-center transition"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearchSubmit(undefined, suggestion);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-3 transition"
                >
                  <Search className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden lg:flex items-center gap-1">
            <button onClick={() => onNavigate('trending')} className={navItemClass('trending')}>
              <Flame className="w-4 h-4" />
              <span>Trending</span>
            </button>
            <button onClick={() => onNavigate('popular')} className={navItemClass('popular')}>
              <TrendingUp className="w-4 h-4" />
              <span>Popular</span>
            </button>
            <button onClick={() => onNavigate('subscriptions')} className={navItemClass('subscriptions')}>
              <FolderHeart className="w-4 h-4" />
              <span>Subscriptions</span>
            </button>
            <button onClick={() => onNavigate('history')} className={navItemClass('history')}>
              <Clock className="w-4 h-4" />
              <span>History</span>
            </button>
            <button onClick={() => onNavigate('playlists')} className={navItemClass('playlists')}>
              <ListVideo className="w-4 h-4" />
              <span>Playlists</span>
            </button>
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-full transition"
            title={`Theme: ${preferences.theme.toUpperCase()} (Click to toggle)`}
          >
            {preferences.theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-zinc-300" />
            )}
          </button>

          {/* Preferences Button */}
          <button
            onClick={() => onNavigate('preferences')}
            className={`p-2 rounded-full transition ${
              currentView === 'preferences'
                ? 'text-red-500 bg-red-600/10'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
            title="Preferences"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Feed Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-zinc-800/60 py-1.5 px-2 bg-zinc-950/80 overflow-x-auto text-xs">
        <button onClick={() => onNavigate('trending')} className={navItemClass('trending')}>
          <Flame className="w-3.5 h-3.5" />
          <span>Trending</span>
        </button>
        <button onClick={() => onNavigate('popular')} className={navItemClass('popular')}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Popular</span>
        </button>
        <button onClick={() => onNavigate('subscriptions')} className={navItemClass('subscriptions')}>
          <FolderHeart className="w-3.5 h-3.5" />
          <span>Subs</span>
        </button>
        <button onClick={() => onNavigate('history')} className={navItemClass('history')}>
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
        <button onClick={() => onNavigate('playlists')} className={navItemClass('playlists')}>
          <ListVideo className="w-3.5 h-3.5" />
          <span>Playlists</span>
        </button>
      </div>
    </header>
  );
};
