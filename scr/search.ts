import { Track } from "../types/trackType";

export function searchByName(songs: Track[], query: string): Track[] {
  if (!query) return songs;

  const q = query.toLowerCase();

  return songs.filter(
    (song) =>
      song.name?.toLowerCase().includes(q) ||
      song.artists?.some((a) => a.name?.toLowerCase().includes(q)),
  );
}
export function filterByGenre(songs: Track[], genre: string): Track[] {
  if (!genre || genre === "All") return songs;

  const g = genre.toLowerCase();

  return songs.filter(
    (song) =>
      song.name?.toLowerCase().includes(g) ||
      song.artists?.some((a) => a.name?.toLowerCase().includes(g)),
  );
}
export function sortSongs(songs: Track[], sort: string): Track[] {
  const sorted = [...songs];

  switch (sort) {
    case "popular":
      return sorted.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

    case "new":
      return sorted.sort(
        (a, b) =>
          new Date(b.album?.release_date || 0).getTime() -
          new Date(a.album?.release_date || 0).getTime(),
      );

    case "az":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    case "duration":
      return sorted.sort((a, b) => b.duration_ms - a.duration_ms);

    default:
      return songs;
  }
}
export function filterSongs(
  songs: Track[],
  query: string,
  genre: string,
  sort: string,
): Track[] {
  let result = [...songs];

  result = searchByName(result, query);
  result = filterByGenre(result, genre);
  result = sortSongs(result, sort);

  return result;
}
