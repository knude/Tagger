import { createPool, OkPacket, RowDataPacket } from "mysql2/promise";
import config from "./config";
import { TaggerFile, TaggerFiles, TaggerFileWithTags } from "./types";

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

export async function getAllFiles(page: number): Promise<TaggerFiles> {
  const offset = (page - 1) * config.filesPerPage;
  const query = `
    SELECT id, name, extension
    FROM files
    ORDER BY id DESC
    LIMIT ${config.filesPerPage}
    OFFSET ${offset}
  `;
  const [rows] = await pool.query<RowDataPacket[]>(query);
  const taggerFiles = rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    extension: row.extension as string,
  }));
  const totalPages = await getTotalPages([]);
  return {
    files: taggerFiles,
    totalPages,
  }
}

export async function getFileWithTags(fileId: number): Promise<TaggerFileWithTags | null> {
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
}

export async function insertFile(file: Express.Multer.File): Promise<TaggerFile | undefined> {
  const splitName = file.originalname.split('.');
  const name = splitName[0];
  const extension = splitName[1];

    const query = 'INSERT INTO files (name, extension) VALUES (?, ?)';
    const [result] = await pool.query<OkPacket>(query, [name, extension]);
    return {
      id: result.insertId as number,
      name,
      extension,
    };
}

export async function insertTagsToFile(fileNumber: number, tags: string[]): Promise<TaggerFileWithTags> {
  await Promise.all(tags.map(async (tag) => {
    const tagId = await createTag(tag);
    const query = `
      INSERT INTO file_tags (file_id, tag_id)
      VALUES (?, ?)
    `;
    await pool.query(query, [fileNumber, tagId]);
  }));
  return await getFileWithTags(fileNumber) as TaggerFileWithTags;
}


async function createTag(tagName: string): Promise<number> {
  const query = `
    INSERT INTO tags (name)
    VALUES (?)
    ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
  `;
  const [result] = await pool.query<OkPacket>(query, [tagName]);
  return result.insertId as number;
}

async function getTotalPages(tags: string[]): Promise<number> {
  let query = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT files.id
      FROM files
  `;

  if (tags.length > 0) {
    const placeholders = tags.map(() => '?').join(', ');
    query += `
      LEFT JOIN file_tags ON files.id = file_tags.file_id
      LEFT JOIN tags ON file_tags.tag_id = tags.id
      WHERE tags.name IN (${placeholders})
      GROUP BY files.id
      HAVING COUNT(DISTINCT tags.name) = ?
    `;
  }

  query += `
    ) AS totalFiles
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, tags.length > 0 ? [...tags, tags.length] : []);
  return Math.ceil(rows[0].total / config.filesPerPage);
}



export async function searchForFiles(tags: string[], page: number): Promise<TaggerFiles> {
  const offset = (page - 1) * config.filesPerPage;

  const placeholders = tags.map(() => '?').join(', ');

  const query = `
    SELECT files.id, files.name, files.extension
    FROM files
    LEFT JOIN file_tags ON files.id = file_tags.file_id
    LEFT JOIN tags ON file_tags.tag_id = tags.id
    WHERE tags.name IN (${placeholders})
    GROUP BY files.id
    HAVING COUNT(DISTINCT tags.name) = ?
    ORDER BY files.id DESC
    LIMIT ${config.filesPerPage} OFFSET ${offset}
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [...tags, tags.length]);
  const taggerFiles = rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    extension: row.extension as string,
  }));
  const totalPages = await getTotalPages(tags);
  return {
    files: taggerFiles,
    totalPages,
  }
}

async function getFile(fileId: number): Promise<TaggerFile> {
  const query = 'SELECT id, name, extension FROM files WHERE id = ?';
  const [rows] = await pool.query<RowDataPacket[]>(query, [fileId]);
  return {
    id: rows[0].id as number,
    name: rows[0].name as string,
    extension: rows[0].extension as string,
  };
}

export async function deleteFile(fileId: number): Promise<TaggerFile> {
  const file = await getFile(fileId);
  if (!file) {
    throw new Error('File not found');
  }

  const deleteFileTagsQuery = 'DELETE FROM file_tags WHERE file_id = ?';
  await pool.query(deleteFileTagsQuery, [fileId]);

  const deleteFileQuery = 'DELETE FROM files WHERE id = ?';
  await pool.query(deleteFileQuery, [fileId]);
  return file;
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
