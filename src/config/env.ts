import dotenv from "dotenv";
dotenv.config();

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT) || 8080,
  databaseUrl: must("DATABASE_URL"),

  jwtSecret: must("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",

  refreshSecret: must("REFRESH_SECRET"),
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "14d"
};
