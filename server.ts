import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import session from "./scr/session";
import {
  connectDB,
  getSongsFromDB,
  getSongByIdFromDB,
  getDB,
  getUsersCollection,
  createDefaultUsers,
  createUsers,
} from "./db/database";
import { filterSongs } from "./scr/search";
import bcrypt from "bcrypt";
dotenv.config();
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.set("view engine", "ejs");
server.use(express.static("./public"));
server.set("views", path.join(__dirname, "views"));
server.use(session);
server.use((req, res, next) => {
  res.locals.user = req.session.username;
  next();
});
function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}
function redirectIfAuth(req: any, res: any, next: any) {
  if (req.session.userId) {
    return res.redirect("/home");
  }
  next();
}
server.get("/", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.redirect("/loading");
  }
  res.redirect("/home");
});
server.get("/loading", redirectIfAuth, (req, res) => {
  res.render("loading");
});
server.get("/login", redirectIfAuth, (req, res) => {
  res.render("login");
});
server.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send("Missing credentials");
  }
  const user = await getUsersCollection().findOne({ username });
  if (!user) return res.send("Invalid");
  const match = await bcrypt.compare(password, user.password as string);
  if (!match) return res.send("Invalid");
  req.session.userId = user._id.toString();
  req.session.username = user.username;
  res.redirect("/home");
});
server.get("/register", redirectIfAuth, (req, res) => {
  res.render("register");
});
server.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send("Fill all fields");
  }
  try {
    await createUsers(username, password, "USER");
    return res.redirect("/login");
  } catch {
    res.send("User exists");
  }
});
server.get("/logout", requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
server.get("/home", requireAuth, async (req: Request, res: Response) => {
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
  requireAuth,
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
server.get("/profile", requireAuth, async (req: Request, res: Response) => {
  res.render("profile");
});

server.get("/search", requireAuth, async (req: Request, res: Response) => {
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
server.get("/collection", requireAuth, async (req: Request, res: Response) => {
  try {
    const songs = await getSongsFromDB(30);

    res.render("collection", {
      songs,
    });
  } catch (error) {
    console.error(error);
    res.render("collection", {
      songs: [],
    });
  }
});
server.get("/geusthesong", requireAuth, async (req: Request, res: Response) => {
  res.render("geusthesong");
});
server.get("/moodpage", requireAuth, async (req: Request, res: Response) => {
  res.render("moodpage");
});
server.get("/compare", requireAuth, async (req: Request, res: Response) => {
  res.render("compare");
});

const PORT = 3000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
