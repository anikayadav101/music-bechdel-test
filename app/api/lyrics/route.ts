import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetch lyrics for a song
 * Uses multiple free APIs as fallbacks:
 * 1. Lyrics.ovh (free, no API key needed)
 * 2. Genius API (requires API key, but we can try without for search)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist') || '';
  const title = searchParams.get('title') || '';

  if (!artist || !title) {
    return NextResponse.json(
      { error: 'Missing artist or title' },
      { status: 400 }
    );
  }

  try {
    // Try Lyrics.ovh API first (completely free, no auth needed)
    const lyricsOvhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    
    const response = await fetch(lyricsOvhUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BechdelTest/1.0)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.lyrics) {
        return NextResponse.json({
          lyrics: data.lyrics,
          source: 'lyrics.ovh'
        });
      }
    }

    // Fallback: Try to get lyrics from alternative source
    // Note: Many free lyrics APIs require API keys or have rate limits
    // For now, we'll return a message suggesting manual entry
    
    return NextResponse.json({
      lyrics: null,
      message: 'Lyrics not found automatically. Please paste lyrics manually.',
      source: null
    });

  } catch (error) {
    console.error('Lyrics fetch error:', error);
    return NextResponse.json({
      lyrics: null,
      message: 'Could not fetch lyrics. Please paste lyrics manually.',
      source: null
    });
  }
}


