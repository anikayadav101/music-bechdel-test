'use client';

import ResultCard from './ResultCard';
import type { Song } from '@/lib/types';

interface SongListProps {
  songs: Song[];
  onSongClick?: (song: Song) => void;
}

export default function SongList({ songs, onSongClick }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="metal-card p-6 text-center text-gray-500">
        No songs found. Start analyzing songs to build your database!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <div
          key={song.id}
          onClick={() => onSongClick?.(song)}
          className={onSongClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        >
          {song.bechdelResult ? (
            <ResultCard
              title={song.title}
              artist={song.artist}
              year={song.year}
              result={song.bechdelResult}
            />
          ) : (
            <div className="metal-card p-6">
              <h3 className="text-lg font-semibold text-gray-800">{song.title}</h3>
              <p className="text-gray-600">{song.artist} {song.year && `(${song.year})`}</p>
              <p className="text-sm text-gray-500 mt-2">Not analyzed yet</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

