import { MongoClient, Db, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { Track } from "../types/trackType";
import bcrypt from "bcrypt";

dotenv.config();

const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

let db: Db;
//Database
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

//Playlist
export async function createPlayList(name: string) {
  const db = getDB();
  const newPlaylist = {
    id: Date.now().toString(),
    name,
    tracks: [],
  };
  await db.collection("playlists").insertOne(newPlaylist);
  return newPlaylist;
}
export async function getAlbumsFromDB() {
  const db = getDB();
  const albums = await db.collection("albums").find().toArray();
  const albumsWithImages = await Promise.all(
      albums.map(async (album: any) => {
        const firstTrackId = album.tracks?.[0];
        let coverImage = "/assets/chillvibes.jpg";

        if (firstTrackId) {
          const track = await db.collection("tracks").findOne({
            _id: new ObjectId(firstTrackId),
          });
          coverImage = track?.album?.images?.[0]?.url || coverImage;
        }
        return {
          ...album,
          coverImage,
        };
      }),
  );
  return albumsWithImages;
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
async function saveSongs(songs: any[]) {
  const db = getDB();
  const collection = db.collection("tracks");

  const operations = songs.map((song) => ({
    updateOne: {
      filter: { id: song.id },
      update: {
        $setOnInsert: song,
      },
      upsert: true,
    },
  }));

  const result = await collection.bulkWrite(operations);

  console.log("Saved:", result.upsertedCount);
}
export async function createRandomAlbum(name: string) {
  const db = getDB();
  const randomTracks = await db
      .collection("tracks")
      .aggregate([{ $sample: { size: 15 } }])
      .toArray();
  if (randomTracks.length === 0) {
    console.log("No tracks found");
    return null;
  }
  const trackIds = randomTracks.map((track: any) => track._id);
  const coverImage =
      randomTracks[0]?.album?.images?.[0]?.url || "/assets/chillvibes.jpg";
  const album = {
    name,
    tracks: trackIds,
    coverImage,
    createdAt: new Date(),
  };
  await db.collection("albums").insertOne(album);
  console.log(`Album "${name}" created with ${trackIds.length} tracks`);
  return album;
}
export async function getAlbumByIdFromDB(id: string) {
  const db = getDB();
  
  const album = await db.collection("albums").findOne({
    _id: new ObjectId(id),
  });
  
  if (!album) return null;
  const songs = await db
      .collection("tracks")
      .find({
        _id: { $in: album.tracks },
      })
      .toArray();
  
  const coverImage =
      album.coverImage ||
      songs[0]?.album?.images?.[0]?.url ||
      "/assets/chillvibes.jpg";
  return {
    album: {
      ...album,
      coverImage,
    },
    songs,
  };
}
//User collection
export function getUsersCollection() {
  const db = getDB();
  return db.collection("users");
}
export async function createDefaultUsers() {
  const usersCollection = getUsersCollection();

  const admin = await usersCollection.findOne({ username: "admin" });
  const user = await usersCollection.findOne({ username: "user" });

  if (!admin) {
    await usersCollection.insertOne({
      username: "admin",
      password: await bcrypt.hash("admin", 10),
      role: "ADMIN",
    });
    console.log("Default ADMIN created");
  }

  if (!user) {
    await usersCollection.insertOne({
      username: "user",
      password: await bcrypt.hash("user", 10),
      role: "USER",
    });
    console.log("Default USER created");
  }
}
export async function createUsers(
  username: string,
  password: string,
  role: string = "USER",
) {
  const usersCollection = getUsersCollection();

  const existing = await usersCollection.findOne({ username });

  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await usersCollection.insertOne({
    username,
    password: hashedPassword,
    role,
  });

  console.log("USER created");
}
export {};
