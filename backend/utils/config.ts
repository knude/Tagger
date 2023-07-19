import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  mySqlHost: string;
  mySqlUser: string;
  mySqlPassword: string;
  mySqlDatabase: string;
  mySqlPort: number;
}

const config: Config = {
  port: Number(process.env.PORT) || 3001,
  mySqlHost: process.env.MYSQL_HOST ?? 'localhost',
  mySqlUser: process.env.MYSQL_USER ?? 'root',
  mySqlPassword: process.env.MYSQL_PASSWORD ?? 'password',
  mySqlDatabase: process.env.MYSQL_DATABASE ?? 'tagger-database',
  mySqlPort: Number(process.env.MYSQL_PORT) || 3306,
};

export default config;
