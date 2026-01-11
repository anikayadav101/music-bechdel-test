import { NextRequest, NextResponse } from 'next/server';
import { analyzeBechdelTest, type SongData } from '@/lib/bechdelAnalyzer';

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

    const result = analyzeBechdelTest(songData);

    return NextResponse.json({
      ...result,
      song: {
        title,
        artist,
        year
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze song' },
      { status: 500 }
    );
  }
}


