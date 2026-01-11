'use client';

import { useState, useEffect } from 'react';
import SongSearch from '@/components/SongSearch';
import ResultCard from '@/components/ResultCard';
import SongList from '@/components/SongList';
import StatsChart from '@/components/StatsChart';
import axios from 'axios';

interface BechdelResult {
  pass: boolean;
  status: 'pass' | 'fail' | 'partial';
  confidence: number;
  analysis: {
    femaleCount: number;
    femaleNames: string[];
    malePronouns: number;
    femalePronouns: number;
    topics: {
      romantic: number;
      self: number;
      ambition: number;
      friendship: number;
      other: number;
      dominantTopic: string;
    };
    hasFemaleDialogue: boolean;
    nonRomanticContext: boolean;
  };
  reasoning: string[];
  song: {
    title: string;
    artist: string;
    year?: number;
  };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail' | 'partial'>('all');
  const [songs, setSongs] = useState<any[]>([]);
  const [currentResult, setCurrentResult] = useState<BechdelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadSongs();
    loadStats();
  }, [filter, searchQuery]);

  const loadSongs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filter !== 'all') params.append('filter', filter);
      
      const response = await axios.get(`/api/songs?${params.toString()}`);
      setSongs(response.data.songs || []);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAnalyze = async (data: { title: string; artist: string; lyrics: string; year?: number }) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/analyze', data);
      setCurrentResult(response.data);
      
      // Also save to database
      await axios.post('/api/songs', data);
      
      // Reload songs and stats
      await loadSongs();
      await loadStats();
    } catch (error) {
      console.error('Error analyzing song:', error);
      alert('Failed to analyze song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats?.byDecade
    ? Object.entries(stats.byDecade).map(([decade, data]: [string, any]) => ({
        decade,
        pass: data.pass || 0,
        fail: data.fail || 0,
        partial: data.partial || 0
      }))
    : [];

  return (
    <div className="min-h-screen metal-bg">
      <div className="max-w-7xl mx-auto">
        {/* Title Bar */}
        <div className="metal-bg border-b-2 border-gray-600 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-inner">
              🎵
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Music Bechdel Test</h1>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-red-600"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
          </div>
        </div>

        {/* Search Bar - iTunes Green Style */}
        <div className="metal-bg border-b-2 border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for a song..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 metal-input"
              />
            </div>
            <button className="itunes-search px-6 py-2 rounded">
              Search Music
            </button>
            <button className="metal-button">Browse</button>
          </div>
        </div>

        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-64 metal-sidebar min-h-screen p-4">
            <div className="space-y-1">
              <div className={`p-2 rounded cursor-pointer hover:bg-gray-300 ${filter === 'all' ? 'metal-selected' : ''}`} onClick={() => setFilter('all')}>
                📚 Library
              </div>
              <div className="p-2 rounded cursor-pointer hover:bg-gray-300">
                📻 Radio
              </div>
              <div className="p-2 rounded cursor-pointer hover:bg-gray-300">
                🎵 Music Store
              </div>
              <div className="mt-4 pt-4 border-t border-gray-400">
                <div className="text-xs text-gray-500 uppercase mb-2 px-2">Filters</div>
                <div className={`p-2 rounded cursor-pointer hover:bg-gray-300 ${filter === 'pass' ? 'metal-selected' : ''}`} onClick={() => setFilter('pass')}>
                  🟢 Pass
                </div>
                <div className={`p-2 rounded cursor-pointer hover:bg-gray-300 ${filter === 'partial' ? 'metal-selected' : ''}`} onClick={() => setFilter('partial')}>
                  🟡 Partial
                </div>
                <div className={`p-2 rounded cursor-pointer hover:bg-gray-300 ${filter === 'fail' ? 'metal-selected' : ''}`} onClick={() => setFilter('fail')}>
                  🔴 Fail
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white p-6">
            <SongSearch onAnalyze={handleAnalyze} loading={loading} />
            
            {currentResult && (
              <ResultCard
                title={currentResult.song.title}
                artist={currentResult.song.artist}
                year={currentResult.song.year}
                result={currentResult}
              />
            )}

            {/* Stats Section */}
            <div className="metal-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Stats</h3>
              {stats ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Songs:</span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">🟢 Pass:</span>
                    <span className="font-semibold">{stats.pass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">🟡 Partial:</span>
                    <span className="font-semibold">{stats.partial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">🔴 Fail:</span>
                    <span className="font-semibold">{stats.fail}</span>
                  </div>
                  {stats.total > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pass Rate:</span>
                        <span className="font-semibold text-green-600">
                          {Math.round((stats.pass / stats.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Loading stats...</p>
              )}
            </div>

            <StatsChart data={chartData} />

            {/* Song Database */}
            <div className="metal-card p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Song Database</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="metal-input"
                  />
                </div>
              </div>
              <SongList songs={songs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

