async function getToken(): Promise<string> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET,
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Token error: " + JSON.stringify(data));
  }
  return data.access_token;
}

export async function getSongs(): Promise<any[]> {
  const token = await getToken();

  const query = encodeURIComponent("a");

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10&market=US`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();
  if (!data.tracks) {
    console.error("Spotify error:", data);
    return [];
  }

  const tracks = data.tracks.items;

  const result = tracks.map((track: any) => {
    return {
      id: track.id,
      title: track.name,
      popularity: track.popularity,
      preview: track.preview_url,

      artistName: track.artists[0].name,

      artistImage: track.album.images?.[0]?.url || "/assets/default.jpg",

      albumName: track.album.name,
      albumImage: track.album.images?.[0]?.url || "/assets/default.jpg",
    };
  });

  return result;
}

export {};
