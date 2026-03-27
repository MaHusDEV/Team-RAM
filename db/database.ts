import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import { Track } from "../types/trackType";

dotenv.config();

const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

let db: Db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db("musicmatch");
    console.log(" MongoDB connected");
  } catch (error) {
    console.error(" MongoDB error:", error);
    process.exit(1);
  }
}

export function getDB() {
  if (!db) {
    throw new Error("DB not initialized");
  }
  return db;
}
export async function getSongsFromDB(limit = 30) {
  const db = getDB();
  return await db.collection<Track>("tracks").find().limit(limit).toArray();
}
export async function getSongByIdFromDB(id: string) {
  const db = getDB();

  const track = await db.collection("tracks").findOne({ id });

  if (!track) return null;

  const artistId = track.artists?.[0]?.id;

  let artist = null;

  if (artistId) {
    artist = await db.collection("artists").findOne({ id: artistId });
  }

  return {
    track,
    artist,
  };
}
export async function createPlayList(name: string) {
  const db = getDB();
  const newPlaylist = {
    id: Date.now.toString(),
    name,
    tracks: [],
  };
  await db.collection("playlists").insertOne(newPlaylist);
  return newPlaylist;
}
export async function getPlaylists() {
  const db = getDB();

  return await db.collection("playlists").find().toArray();
}
export async function addSongToPlaylist(playlistId: string, trackId: string) {
  const db = getDB();

  await db.collection("playlists").updateOne(
    { id: playlistId },
    {
      $addToSet: { tracks: trackId },
    },
  );
}
export {};
