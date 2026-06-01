import { apiClient } from './client';

export interface GenreItem {
  genre_id: number;
  genre_name: string;
}

export async function fetchMyGenres(): Promise<GenreItem[]> {
  const { data } = await apiClient.get<GenreItem[]>('/api/return-comment-genres');
  return data;
}

export async function addMyGenre(name: string): Promise<GenreItem[]> {
  const { data } = await apiClient.post<GenreItem[]>('/api/return-comment-genres', { name });
  return data;
}

export async function deleteMyGenre(genreId: number): Promise<GenreItem[]> {
  const { data } = await apiClient.delete<GenreItem[]>(`/api/return-comment-genres/${genreId}`);
  return data;
}
