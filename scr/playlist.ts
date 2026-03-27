import { SpotifyTrack, Playlist } from "../types/plalistType";

let playlists: Playlist[] = [];

export function createPlayList(name: string) {
  const newPlaylist: Playlist = {
    id: Date.now().toString(),
    name,
    track: [],
  };
  playlists.push(newPlaylist);
}

export function getPlaylists() {
  return playlists;
}
export function addSongsToPlaylist(playlistId: string, trackId: string) {
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    console.log("Playlist not found");
    return;
  }

  if (!playlist.track.includes(trackId)) {
    playlist.track.push(trackId);
  }
}
export {};
