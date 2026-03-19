import express, { Request, Response } from "express";
import path from "path";
import { getSongs } from "./api";
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
server.get("/home", async (req: Request, res: Response) => {
  try {
    const songs = await getSongs();

    res.render("home", { songs });
  } catch (err) {
    console.log(err);
    res.render("home", { songs: [] });
  }
});
server.get("/", async (req: Request, res: Response) => {
  res.render("home");
});
server.get("/details", async (req: Request, res: Response) => {
  res.render("details");
});
server.get("/profile", async (req: Request, res: Response) => {
  res.render("profile");
});
server.get("/login", async (req: Request, res: Response) => {
  res.render("login");
});
server.get("/register", async (req: Request, res: Response) => {
  res.render("register");
});

const PORT = 3000;
server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
