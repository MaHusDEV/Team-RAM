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
  res.render("collection");
});
server.get("/geusthesong", async (req: Request, res: Response) => {
  res.render("geusthesong");
});
server.get("/moodpage", async (req: Request, res: Response) => {
  res.render("moodpage");
});
server.get("/compare", async (req: Request, res: Response) => {
  res.render("compare");
});

const PORT = 3000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
