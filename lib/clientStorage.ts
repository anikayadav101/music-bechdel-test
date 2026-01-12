// Client-side storage using localStorage (for GitHub Pages compatibility)

import type { Song } from './types';
import { analyzeBechdelTest, type SongData } from './bechdelAnalyzer';

const STORAGE_KEY = 'bechdel_songs_db';

export function getSongs(filters?: {
  query?: string;
  status?: 'pass' | 'fail' | 'partial';
}): Song[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  let songs: Song[] = JSON.parse(stored);
  
  if (filters?.query) {
    const lowerQuery = filters.query.toLowerCase();
    songs = songs.filter(
      song =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery)
    );
  }
  
  if (filters?.status) {
    songs = songs.filter(
      song => song.bechdelResult?.status === filters.status
    );
  }
  
  return songs;
}

export function addSong(song: Omit<Song, 'id'>): Song {
  if (typeof window === 'undefined') {
    throw new Error('localStorage not available');
  }
  
  const songs = getSongs();
  const newSong: Song = {
    ...song,
    id: Date.now().toString()
  };
  
  songs.push(newSong);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  
  return newSong;
}

export function getStats() {
  const songs = getSongs();
  
  const stats = {
    total: 0,
    pass: 0,
    fail: 0,
    partial: 0,
    byDecade: {} as Record<string, { total: number; pass: number; fail: number; partial: number }>
  };
  
  songs.forEach(song => {
    if (!song.bechdelResult) return;
    
    stats.total++;
    const status = song.bechdelResult.status;
    stats[status]++;
    
    const decade = song.year ? `${Math.floor(song.year / 10) * 10}s` : null;
    if (decade) {
      if (!stats.byDecade[decade]) {
        stats.byDecade[decade] = { total: 0, pass: 0, fail: 0, partial: 0 };
      }
      stats.byDecade[decade].total++;
      stats.byDecade[decade][status]++;
    }
  });
  
  return stats;
}

// Client-side analysis function
export function analyzeSong(data: { title: string; artist: string; lyrics: string; year?: number }) {
  const songData: SongData = {
    title: data.title,
    artist: data.artist,
    lyrics: data.lyrics,
    year: data.year
  };
  
  const result = analyzeBechdelTest(songData);
  
  return {
    ...result,
    song: {
      title: data.title,
      artist: data.artist,
      year: data.year
    }
  };
}

// Client-side iTunes search
export async function searchSongs(query: string) {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`
    );
    
    if (!response.ok) {
      throw new Error('iTunes API error');
    }
    
    const data = await response.json();
    const localSongs = getSongs({ query });
    
    const results: any[] = [];
    
    if (data.results && data.results.length > 0) {
      const itunesResults = data.results.map((track: any) => {
        const releaseYear = track.releaseDate 
          ? new Date(track.releaseDate).getFullYear()
          : undefined;
        
        return {
          id: `itunes_${track.trackId}`,
          title: track.trackName,
          artist: track.artistName,
          year: releaseYear,
          album: track.collectionName,
          artwork: track.artworkUrl100,
          previewUrl: track.previewUrl,
          source: 'itunes',
          lyrics: ''
        };
      });
      
      results.push(...itunesResults);
    }
    
    const localResults = localSongs
      .filter(song => {
        return !results.some(r => 
          r.title.toLowerCase() === song.title.toLowerCase() &&
          r.artist.toLowerCase() === song.artist.toLowerCase()
        );
      })
      .slice(0, 10)
      .map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        year: song.year,
        source: 'local',
        lyrics: song.lyrics || ''
      }));
    
    results.push(...localResults);
    
    return { results: results.slice(0, 20) };
  } catch (error) {
    console.error('Search error:', error);
    const localSongs = getSongs({ query });
    return {
      results: localSongs.slice(0, 10).map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        year: song.year,
        source: 'local',
        lyrics: song.lyrics || ''
      }))
    };
  }
}

// Client-side lyrics fetch
export async function fetchLyrics(artist: string, title: string) {
  try {
    const lyricsOvhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    
    const response = await fetch(lyricsOvhUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BechdelTest/1.0)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.lyrics) {
        return {
          lyrics: data.lyrics,
          source: 'lyrics.ovh'
        };
      }
    }
    
    return {
      lyrics: null,
      message: 'Lyrics not found automatically. Please paste lyrics manually.',
      source: null
    };
  } catch (error) {
    console.error('Lyrics fetch error:', error);
    return {
      lyrics: null,
      message: 'Could not fetch lyrics. Please paste lyrics manually.',
      source: null
    };
  }
}

