import { createPool, OkPacket, RowDataPacket } from "mysql2/promise";
import config from "./config";
import { TaggerFile, TaggerFileWithTags } from "./types";

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
        PRIMARY KEY (id),
        UNIQUE KEY (name)
        )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_tags (
        file_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (file_id, tag_id),
        FOREIGN KEY (file_id) REFERENCES files(id),
        FOREIGN KEY (tag_id) REFERENCES tags(id)
      )
    `);
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing the database:", error);
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
    console.error("Error retrieving files:", error);
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
    console.error("Error retrieving file with tags:", error);
    return null;
  }
}

export async function insertFile(file: Express.Multer.File): Promise<TaggerFile | undefined> {
  const splitName = file.originalname.split('.');
  const name = splitName[0];
  const extension = splitName[1];

  try {
    const query = 'INSERT INTO files (name, extension) VALUES (?, ?)';
    const [result] = await pool.query<OkPacket>(query, [name, extension]);
    return {
      id: result.insertId as number,
      name,
      extension,
    };
  } catch (error) {
    console.error('Error inserting file:', error);
    return undefined;
  }
}

export async function insertTagsToFile(fileNumber: number, tags: string[]): Promise<TaggerFileWithTags> {
  try {
    await Promise.all(tags.map(async (tag) => {
      const tagId = await createTag(tag);
      const query = `
        INSERT INTO file_tags (file_id, tag_id)
        VALUES (?, ?)
      `;
      await pool.query(query, [fileNumber, tagId]);
    }));
  } catch (error) {
    console.error('Error inserting tags to file:', error);
  }
  return await getFileWithTags(fileNumber) as TaggerFileWithTags;
}


async function createTag(tagName: string): Promise<number> {
  try {
    const query = `
      INSERT INTO tags (name)
      VALUES (?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
    `;
    const [result] = await pool.query<OkPacket>(query, [tagName]);
    return result.insertId as number;
  } catch (error) {
    console.error('Error inserting tag:', error);
    throw error;
  }
}

export async function searchByTags(tags: string[]): Promise<TaggerFile[]> {
  try {

    const placeholders = Array.from({ length: tags.length }, () => '?').join(', ');

    const query = `
      SELECT files.id, files.name, files.extension
      FROM files
      LEFT JOIN file_tags ON files.id = file_tags.file_id
      LEFT JOIN tags ON file_tags.tag_id = tags.id
      WHERE tags.name IN (${placeholders})
      GROUP BY files.id
      HAVING COUNT(DISTINCT tags.name) = ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [...tags, tags.length]);
    return rows.map((row) => ({
      id: row.id as number,
      name: row.name as string,
      extension: row.extension as string,
    }));
  } catch (error) {
    console.error('Error searching by tags:', error);
    return [];
  }
}

export async function clearDatabase(): Promise<void> {
  try {
    await pool.query('DELETE FROM file_tags');
    await pool.query('DELETE FROM files');
    await pool.query('DELETE FROM tags');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}
