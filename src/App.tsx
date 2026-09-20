import React, { useState, useEffect } from 'react';
import { UserPreferences } from './types';
import { getPreferences, savePreferences } from './utils/storage';
import { Navbar } from './components/Navbar';
import { FeedView } from './components/FeedView';
import { VideoWatch } from './components/VideoWatch';
import { SearchView } from './components/SearchView';
import { ChannelView } from './components/ChannelView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { HistoryView } from './components/HistoryView';
import { PlaylistsView } from './components/PlaylistsView';
import { PreferencesView } from './components/PreferencesView';

export function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(getPreferences());
  const [currentView, setCurrentView] = useState<string>('trending');
  const [viewParam, setViewParam] = useState<string>('');

  // Synchronize initial route from URL
  useEffect(() => {
    function syncRouteFromURL() {
      const path = window.location.pathname;
      const search = new URLSearchParams(window.location.search);

      if (path === '/watch' || search.has('v')) {
        setCurrentView('watch');
        setViewParam(search.get('v') || 'aqz-KE-bpKQ');
      } else if (path.startsWith('/channel/')) {
        setCurrentView('channel');
        setViewParam(path.replace('/channel/', ''));
      } else if (path === '/search' || search.has('q')) {
        setCurrentView('search');
        setViewParam(search.get('q') || '');
      } else if (path === '/feed/popular' || path === '/popular') {
        setCurrentView('popular');
      } else if (path === '/feed/subscriptions' || path === '/subscriptions') {
        setCurrentView('subscriptions');
      } else if (path === '/feed/history' || path === '/history') {
        setCurrentView('history');
      } else if (path === '/feed/playlists' || path === '/playlists') {
        setCurrentView('playlists');
      } else if (path === '/preferences') {
        setCurrentView('preferences');
      } else {
        setCurrentView('trending');
      }
    }

    syncRouteFromURL();
    window.addEventListener('popstate', syncRouteFromURL);
    return () => window.removeEventListener('popstate', syncRouteFromURL);
  }, []);

  const navigate = (view: string, param = '') => {
    setCurrentView(view);
    setViewParam(param);

    let newUrl = '/';
    if (view === 'watch') {
      newUrl = `/watch?v=${param}`;
    } else if (view === 'channel') {
      newUrl = `/channel/${param}`;
    } else if (view === 'search') {
      newUrl = `/search?q=${encodeURIComponent(param)}`;
    } else if (view === 'popular') {
      newUrl = '/feed/popular';
    } else if (view === 'subscriptions') {
      newUrl = '/feed/subscriptions';
    } else if (view === 'history') {
      newUrl = '/feed/history';
    } else if (view === 'playlists') {
      newUrl = '/feed/playlists';
    } else if (view === 'preferences') {
      newUrl = '/preferences';
    } else {
      newUrl = '/';
    }

    try {
      window.history.pushState({}, '', newUrl);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  // Determine root container theme styling
  const themeClasses = {
    dark: 'bg-[#121212] text-[#f1f1f1]',
    oled: 'bg-[#000000] text-white',
    light: 'bg-[#f9f9f9] text-[#0f0f0f]',
  }[preferences.theme] || 'bg-[#121212] text-[#f1f1f1]';

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors flex flex-col font-sans`}>
      <Navbar
        currentView={currentView}
        onNavigate={navigate}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
      />

      <main className="flex-1">
        {currentView === 'trending' && (
          <FeedView
            feedType="trending"
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'popular' && (
          <FeedView
            feedType="popular"
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'watch' && (
          <VideoWatch
            videoId={viewParam || 'aqz-KE-bpKQ'}
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            query={viewParam}
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'channel' && (
          <ChannelView
            channelId={viewParam || 'UCbTvG80-nQz9z9Xk9r5cWwA'}
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'subscriptions' && (
          <SubscriptionsView
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'playlists' && (
          <PlaylistsView
            preferences={preferences}
            onSelectVideo={(id) => navigate('watch', id)}
            onSelectChannel={(id) => navigate('channel', id)}
          />
        )}

        {currentView === 'preferences' && (
          <PreferencesView
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-6 px-4 text-center text-xs text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">Invidious</span>
            <span>— Open source alternative front-end to YouTube</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('preferences')}
              className="hover:text-zinc-300 transition"
            >
              Preferences
            </button>
            <a
              href="https://github.com/iv-org/invidious"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 transition"
            >
              Source Code
            </a>
            <span className="text-zinc-600">Privacy-First</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
