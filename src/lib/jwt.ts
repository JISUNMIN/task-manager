// lib/jwt.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export function signJwt(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" }); // 7일 유효
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
