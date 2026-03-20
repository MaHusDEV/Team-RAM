import express, { Request, Response } from "express";
import path from "path";
import { getSongs, getSongById } from "./api";
import { Track } from "./types/trackType";
import dotenv from "dotenv";

dotenv.config();
const server = express();

server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(express.static("./public"));
server.set("views", path.join(__dirname, "views"));

server.get("/", async (req: Request, res: Response) => {
  try {
    const songs = await getSongs();
    res.render("home", { songs });
  } catch (err) {
    console.log(err);
    res.render("home", { songs: [] });
  }
});
server.get(
  "/details/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const track = await getSongById(req.params.id);
      const songs = await getSongs();
      if (!track) {
        return res.send("Track not found");
      }

      const filteredSongs = songs.filter((s) => s.id !== track.id);

      res.render("details", { track, songs: filteredSongs });
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
  res.render("search");
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
