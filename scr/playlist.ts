import { ObjectId } from "mongodb";
import { getDB } from "../db/database";

export async function createPlaylist() {
    const db = getDB();

    const jazzDocs = await db.collection("tracks").find({
        $or: [
            { "album.name": { $regex: "jazz", $options: "i" } },
            { album: { $regex: "jazz", $options: "i" } },
            { name: { $regex: "jazz", $options: "i" } }
        ]
    }).project({ _id: 1 }).toArray();

    const trackIds = jazzDocs.map(d => d._id).filter(Boolean) as ObjectId[];

    if (trackIds.length === 0) {
        console.log("No Jazz tracks found. Albums collection not modified.");
        return { created: false, count: 0 };
    }

    const result = await db.collection("albums").updateOne(
        { name: "Jazz" },
        {
            $setOnInsert: { name: "Jazz", createdAt: new Date() },
            $addToSet: { tracks: { $each: trackIds } }
        },
        { upsert: true }
    );

    return {
        created: result.upsertedCount > 0,
        modifiedCount: result.modifiedCount,
        addedCount: trackIds.length
    };
}
export async function getPlaylistFromDB() {
    const db = getDB();
    const playlists = await db.collection("playlists").find().toArray();
    return playlists;   
}
export{};