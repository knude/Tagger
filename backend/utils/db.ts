import {createPool, RowDataPacket} from "mysql2/promise";
import config from "./config";
import {TaggerFile, TaggerFileWithTags} from "./types";

const pool = createPool({
  host: config.mySqlHost,
  user: config.mySqlUser,
  password: config.mySqlPassword,
  database: config.mySqlDatabase,
  port: config.mySqlPort,
  connectionLimit: 10,
});

export async function initializeDatabase(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
       id INT NOT NULL AUTO_INCREMENT,
       name VARCHAR(255) NOT NULL,
        extension VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
          PRIMARY KEY (id)
        )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_tags (
        file_id INT NOT NULL,
        tag_id INT NOT NULL,
        FOREIGN KEY (file_id) REFERENCES files (id),
        FOREIGN KEY (tag_id) REFERENCES tags (id),
        PRIMARY KEY (file_id, tag_id)
      )
    `);
    console.log("Database initialized");
  } catch (error) {
    console.log("Error initializing the database:", error);
  }
}

export async function getAllFiles(): Promise<TaggerFile[]> {
  try {
    const query = "SELECT * FROM files";
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows.map((row) => ({
      id: row.id as number,
      name: row.name as string,
      extension: row.extension as string,
    }));
  } catch (error) {
    console.log("Error retrieving files:", error);
    return [];
  }
}

export async function getFileWithTags(fileId: number): Promise<TaggerFileWithTags | null> {
  try {
    const query = `
      SELECT files.id, files.name, files.extension, tags.id AS tagId, tags.name AS tagName
      FROM files
      LEFT JOIN file_tags ON files.id = file_tags.file_id
      LEFT JOIN tags ON file_tags.tag_id = tags.id
      WHERE files.id = ?
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [fileId]);
    if (rows.length === 0) {
      return null;
    }
    return {
      id: rows[0].id as number,
      name: rows[0].name as string,
      extension: rows[0].extension as string,
      tags: rows.map((row) => ({
        id: row.tagId as number,
        name: row.tagName as string,
      })),
    };
  } catch (error) {
    console.log("Error retrieving file with tags:", error);
    return null;
  }
}