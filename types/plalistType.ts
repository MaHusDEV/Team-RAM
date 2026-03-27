export interface SpotifyTrack {
  _id?: any;

  id: string;
  name: string;
  type: "track";
  uri: string;

  duration_ms: number;
  explicit: boolean;
  disc_number: number;
  track_number: number;

  is_local: boolean;
  is_playable: boolean;

  popularity?: number;

  href: string;

  external_ids: {
    isrc: string;
  };

  external_urls: {
    spotify: string;
  };

  artists: {
    id: string;
    name: string;
    type: "artist";
    uri: string;
    href: string;

    external_urls: {
      spotify: string;
    };
  }[];

  album: {
    id: string;
    name: string;
    type: "album";
    uri: string;

    album_type: string;

    total_tracks: number;

    release_date: string;
    release_date_precision: string;

    is_playable: boolean;

    href: string;

    external_urls: {
      spotify: string;
    };

    images: {
      url: string;
      width: number;
      height: number;
    }[];

    artists: {
      id: string;
      name: string;
      type: "artist";
      uri: string;
      href: string;

      external_urls: {
        spotify: string;
      };
    }[];
  };
}
type TrackId = string;

export type Playlist = {
  id: string;
  name: string;
  tracks: TrackId[];
};

export {};
