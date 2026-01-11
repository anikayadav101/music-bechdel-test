// Shared in-memory database
// In production, this would be replaced with a real database (PostgreSQL, MongoDB, etc.)

import type { Song } from './types';

export let songsDatabase: Song[] = [];

export function addSong(song: Song) {
  songsDatabase.push(song);
  return song;
}

export function getSongs(filters?: {
  query?: string;
  status?: 'pass' | 'fail' | 'partial';
}) {
  let filtered = [...songsDatabase];

  if (filters?.query) {
    const lowerQuery = filters.query.toLowerCase();
    filtered = filtered.filter(
      song =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters?.status) {
    filtered = filtered.filter(
      song => song.bechdelResult?.status === filters.status
    );
  }

  return filtered;
}

export function getStats() {
  const stats = {
    total: 0,
    pass: 0,
    fail: 0,
    partial: 0,
    byDecade: {} as Record<string, { total: number; pass: number; fail: number; partial: number }>
  };

  songsDatabase.forEach(song => {
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


