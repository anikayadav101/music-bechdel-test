'use client';

import { useState, useEffect, useRef } from 'react';
import { searchSongs, fetchLyrics } from '@/lib/clientStorage';

interface SongSearchProps {
  onAnalyze: (data: { title: string; artist: string; lyrics: string; year?: number }) => void;
  loading?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  year?: number;
  lyrics: string;
  album?: string;
  artwork?: string;
  previewUrl?: string;
  source?: 'itunes' | 'local';
}

export default function SongSearch({ onAnalyze, loading }: SongSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [year, setYear] = useState('');
  const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null);
  const [fetchingLyrics, setFetchingLyrics] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for songs
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length >= 2) {
        try {
          const response = await searchSongs(searchQuery);
          setSearchResults(response.results || []);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSongSelect = async (song: SearchResult) => {
    setSelectedSong(song);
    setTitle(song.title);
    setArtist(song.artist);
    setYear(song.year?.toString() || '');
    setSearchQuery(`${song.title} - ${song.artist}`);
    setShowDropdown(false);

    // If lyrics are already available (from local database), use them
    if (song.lyrics) {
      setLyrics(song.lyrics);
    } else {
      // Try to fetch lyrics automatically
      setFetchingLyrics(true);
      setLyrics(''); // Clear while fetching
      
      try {
        const lyricsData = await fetchLyrics(song.artist, song.title);
        
        if (lyricsData.lyrics) {
          setLyrics(lyricsData.lyrics);
        } else {
          // Show message that lyrics need to be entered manually
          setLyrics('');
        }
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setLyrics('');
      } finally {
        setFetchingLyrics(false);
      }
    }
  };

  const handleAnalyze = () => {
    if (!title || !artist || !lyrics) {
      alert('Please wait for lyrics to load or select a different song');
      return;
    }
    onAnalyze({
      title,
      artist,
      lyrics,
      year: year ? parseInt(year) : undefined
    });
  };

  return (
    <div className="metal-card p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Analyze a Song</h2>
      
      {/* Search Bar */}
      <div className="relative mb-6" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) {
                setSelectedSong(null);
                setTitle('');
                setArtist('');
                setYear('');
                setLyrics('');
              }
            }}
            className="w-full px-4 py-3 pl-10 metal-input"
            placeholder="Search for a song..."
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Dropdown Results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 metal-card max-h-80 overflow-y-auto">
            {searchResults.map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => handleSongSelect(song)}
                className="w-full text-left px-4 py-3 hover:bg-blue-100 focus:bg-blue-100 focus:outline-none transition-colors border-b border-gray-200 last:border-b-0 flex items-center gap-3"
              >
                {song.artwork && (
                  <img 
                    src={song.artwork} 
                    alt={`${song.title} artwork`}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{song.title}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {song.artist} {song.year && `• ${song.year}`}
                  </div>
                  {song.album && (
                    <div className="text-xs text-gray-500 truncate">{song.album}</div>
                  )}
                </div>
                {song.source === 'itunes' && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex-shrink-0">
                    iTunes
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="absolute z-50 w-full mt-1 metal-card p-4 text-center text-gray-500">
            No songs found. Try a different search term.
          </div>
        )}
      </div>

      {/* Selected Song Details */}
      {selectedSong && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-start gap-4">
            {selectedSong.artwork && (
              <img 
                src={selectedSong.artwork} 
                alt={`${title} artwork`}
                className="w-24 h-24 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
              <p className="text-gray-600">{artist}</p>
              {year && (
                <p className="text-sm text-gray-500">{year}</p>
              )}
              {selectedSong.album && (
                <p className="text-sm text-gray-500 mt-1">{selectedSong.album}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-1">
              Lyrics {fetchingLyrics && <span className="text-blue-600 text-xs">(Fetching...)</span>}
            </label>
            {fetchingLyrics ? (
              <div className="w-full px-4 py-8 metal-input font-mono text-sm text-center text-gray-400">
                Fetching lyrics...
              </div>
            ) : lyrics ? (
              <div className="space-y-2">
                <textarea
                  id="lyrics"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 metal-input font-mono text-sm"
                  placeholder="Lyrics will appear here..."
                />
                <p className="text-xs text-gray-500">You can edit the lyrics if needed</p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  id="lyrics"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 metal-input font-mono text-sm"
                  placeholder="Lyrics not found automatically. Please paste them here..."
                />
                <p className="text-xs text-gray-500">Lyrics not found automatically. Please paste them manually.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !lyrics || fetchingLyrics}
            className="w-full metal-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Song'}
          </button>
        </div>
      )}
    </div>
  );
}

