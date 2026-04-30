import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import {
  connectDB,
  getSongsFromDB,
  getSongByIdFromDB,
  getDB,
} from "./db/database";

import { filterSongs } from "./scr/search";
dotenv.config();
const server = express();

server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(express.static("./public"));
server.set("views", path.join(__dirname, "views"));
server.get("/lading", async (req: Request, res: Response) => {
  res.render("lading");
});
server.get("/", async (req: Request, res: Response) => {
  try {
    const { q, genre, sort } = req.query;

    const allSongs = await getSongsFromDB(100);

    const filteredSongs = filterSongs(
      allSongs,
      (q as string) || "",
      (genre as string) || "All",
      (sort as string) || "popular",
    );

    res.render("home", {
      songs: allSongs,
      trendingSongs: filteredSongs,
      query: q || "",
      genre: genre || "All",
      sort: sort || "popular",
    });
  } catch (err) {
    console.log(err);
    res.render("home", { songs: [] });
  }
});
server.get(
  "/details/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const data = await getSongByIdFromDB(req.params.id);

      if (!data) {
        return res.send("Track not found");
      }

      const { track, artist } = data;

      const songs = (await getSongsFromDB(30))
        .filter((s) => s.id !== track.id)
        .slice(0, 12);

      const artistId = track.artists?.[0]?.id;

      let moreFromArtist: any[] = [];

      if (artistId) {
        moreFromArtist = await getDB()
          .collection("tracks")
          .find({
            "artists.id": artistId,
            id: { $ne: track.id },
          })
          .limit(12)
          .toArray();
      }

      res.render("details", {
        track,
        artist,
        songs,
        moreFromArtist,
      });
    } catch (error) {
      console.error(error);
      res.send("Error loading track");
    }
  },
);
server.get("/profile", async (req: Request, res: Response) => {
  res.render("profile");
});
server.get("/login", async (req: Request, res: Response) => {
  res.render("login");
});
server.get("/register", async (req: Request, res: Response) => {
  res.render("register");
});
server.get("/search", async (req: Request, res: Response) => {
  try {
    const { q, genre, sort } = req.query;
    const songs = await getSongsFromDB(100);

    const filtered = filterSongs(
      songs,
      (q as string) || "",
      (genre as string) || "All",
      (sort as string) || "popular",
    );
    res.render("search", {
      songs: filtered,
      query: q || "",
      genre: genre || "All",
      sort: sort || "popular",
    });
  } catch (err) {
    console.error(err);
    res.render("search", { songs: [] });
  }
});
server.get("/collection", async (req: Request, res: Response) => {
  try {
    const { q, sort } = req.query;

    let songs = await getSongsFromDB(100);

    if (q) {
      songs = songs.filter((song: any) =>
        song.album?.name?.toLowerCase().includes((q as string).toLowerCase()),
      );
    }

    if (sort === "az") {
      songs.sort((a: any, b: any) =>
        (a.album?.name || "").localeCompare(b.album?.name || ""),
      );
    }

    if (sort === "za") {
      songs.sort((a: any, b: any) =>
        (b.album?.name || "").localeCompare(a.album?.name || ""),
      );
    }

    res.render("collection", {
      songs,
      query: q || "",
      sort: sort || "",
    });
  } catch (error) {
    console.error(error);

    res.render("collection", {
      songs: [],
      query: "",
      sort: "",
    });
  }
});

// server.get("/collectiondetail", async (req: Request, res: Response) => {
//   try {
//     const songs = await getSongsFromDB(20);

//     if (!songs || songs.length === 0) {
//       return res.send("Geen songs gevonden");
//     }

//     const track: any = songs[0];

//     const artist = {
//       name: track?.artists?.[0]?.name || "Unknown Artist",
//       images: [],
//     };

//     res.render("collectiondetail", {
//       track,
//       artist,
//       songs,
//     });
//   } catch (error) {
//     console.error(error);
//     res.send("Fout bij laden van collection detail");
//   }
// });

server.get(
  "/collectiondetail/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { q, sort } = req.query;

      const data = await getSongByIdFromDB(req.params.id);

      if (!data) {
        return res.send("Playlist niet gevonden");
      }

      const { track } = data;

      const albumName = (track as any).album?.name;

      let songs = (await getSongsFromDB(100)).filter(
        (s: any) => s.album?.name === albumName,
      );

      if (q) {
        songs = songs.filter((song: any) =>
          song.name?.toLowerCase().includes((q as string).toLowerCase()),
        );
      }

      if (sort === "az") {
        songs.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }

      if (sort === "za") {
        songs.sort((a: any, b: any) => b.name.localeCompare(a.name));
      }

      res.render("collectiondetail", {
        track,
        songs,
        query: q || "",
        sort: sort || "",
      });
    } catch (error) {
      console.error(error);
      res.send("Fout");
    }
  },
);

server.get("/geusthesong", async (req: Request, res: Response) => {
  res.render("geusthesong");
});
server.get("/moodpage", async (req: Request, res: Response) => {
  try {
    const songs = await getSongsFromDB(100);

    const randomSongs = songs.sort(() => Math.random() - 0.5).slice(0, 6);

    res.render("moodpage", {
      songs: randomSongs,
    });
  } catch (err) {
    console.error(err);

    res.render("moodpage", {
      songs: [],
    });
  }
});

server.post("/create-playlist", async (req: Request, res: Response) => {
  try {
    const { playlistName } = req.body;

    console.log("Nieuwe playlist:", playlistName);

    if (!playlistName) {
      return res.redirect("/collection");
    }

    await getDB().collection("playlists").insertOne({
      name: playlistName,
      createdAt: new Date(),
      songs: [],
    });

    res.redirect("/collection");
  } catch (error) {
    console.error(error);
    res.redirect("/collection");
  }
});

server.get("/compare", async (req: Request, res: Response) => {
  res.render("compare");
});

const PORT = 3000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
