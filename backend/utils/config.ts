import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  mySqlHost: string;
  mySqlUser: string;
  mySqlPassword: string;
  mySqlDatabase: string;
  mySqlPort: number;
  minioEndPoint: string;
  minioPort: number;
  minioAccessKey: string;
  minioSecretKey: string;
  allowedFiles: string[];
}

const config: Config = {
  port: Number(process.env.PORT) || 3001,
  mySqlHost: process.env.MYSQL_HOST ?? 'localhost',
  mySqlUser: process.env.MYSQL_USER ?? 'root',
  mySqlPassword: process.env.MYSQL_PASSWORD ?? 'password',
  mySqlDatabase: process.env.MYSQL_DATABASE ?? 'tagger-database',
  mySqlPort: Number(process.env.MYSQL_PORT) || 3306,
  minioEndPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  minioPort: Number(process.env.MINIO_PORT) || 9000,
  minioAccessKey: process.env.MINIO_ACCESS_KEY ?? "tagger",
  minioSecretKey: process.env.MINIO_SECRET_KEY ?? "taggerPassword",
  allowedFiles: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/webm",
    "video/mp4",
  ],
};

export default config;
