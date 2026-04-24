import dotenv from "dotenv";
dotenv.config();

import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    userId?: string;
    username?: string;
  }
}
export default session({
  secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 7,
  },
});
