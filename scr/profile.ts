import {getDB} from "../db/database";
import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "public", "uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});
//Images
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed") as any, false);
    }
};


export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 //5mb
    }
});
export async function updateAvatar(userId: string | undefined, filename: string) {
    const db = getDB();
    const collection = db.collection('profile');
    await collection.updateOne(
        { userId },
        { $set: { avatar: filename } },
        { upsert: true }
    );
}



