import { NextRequest, NextResponse } from 'next/server';
import { getSongs } from '@/lib/database';

interface iTunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  releaseDate?: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // First, search iTunes API for songs
    const itunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`
    );
    
    if (!itunesResponse.ok) {
      throw new Error('iTunes API error');
    }

    const itunesData = await itunesResponse.json();
    
    // Also check local database
    const localSongs = getSongs({ query });
    
    // Combine results: iTunes results first, then local
    const results: any[] = [];
    
    // Add iTunes results
    if (itunesData.results && itunesData.results.length > 0) {
      const itunesResults = itunesData.results.map((track: iTunesResult) => {
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
          lyrics: '' // Will be fetched separately if needed
        };
      });
      
      results.push(...itunesResults);
    }
    
    // Add local database results (excluding duplicates)
    const localResults = localSongs
      .filter(song => {
        // Check if not already in results
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
    
    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error('Search error:', error);
    
    // Fallback to local database only
    const localSongs = getSongs({ query });
    const results = localSongs.slice(0, 10).map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      year: song.year,
      source: 'local',
      lyrics: song.lyrics || ''
    }));
    
    return NextResponse.json({ results });
  }
}

