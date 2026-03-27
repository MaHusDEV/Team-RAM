export type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    release_date: string;
  };
  duration_ms: number;
  popularity?: number;
  genre?: string;
};
export {};
