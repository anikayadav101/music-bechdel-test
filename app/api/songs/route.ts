import { NextRequest, NextResponse } from 'next/server';
import { analyzeBechdelTest, type SongData } from '@/lib/bechdelAnalyzer';
import type { Song } from '@/lib/types';
import { getSongs, addSong } from '@/lib/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const filter = searchParams.get('filter') || 'all';

  const songs = getSongs({
    query: query || undefined,
    status: filter !== 'all' ? (filter as 'pass' | 'fail' | 'partial') : undefined
  });

  return NextResponse.json({ songs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, artist, lyrics, year, collaborators } = body;

    if (!title || !artist || !lyrics) {
      return NextResponse.json(
        { error: 'Missing required fields: title, artist, lyrics' },
        { status: 400 }
      );
    }

    const songData: SongData = {
      title,
      artist,
      lyrics,
      year,
      collaborators
    };

    const bechdelResult = analyzeBechdelTest(songData);

    const song: Song = {
      id: Date.now().toString(),
      title,
      artist,
      year,
      lyrics,
      collaborators,
      bechdelResult
    };

    addSong(song);

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error('Error saving song:', error);
    return NextResponse.json(
      { error: 'Failed to save song' },
      { status: 500 }
    );
  }
}

