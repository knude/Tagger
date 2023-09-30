import { createPool, OkPacket, RowDataPacket } from "mysql2/promise";
import config from "./config";
import { TaggerFile, TaggerFiles, TaggerFileWithTags, TaggerTags } from "./types";

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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_tags (
        user_id VARCHAR(255) NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (user_id, tag_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (tag_id) REFERENCES tags(id)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_files (
        user_id VARCHAR(255) NOT NULL,
        file_id INT NOT NULL,
        PRIMARY KEY (user_id, file_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (file_id) REFERENCES files(id)
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
  if (!fileId) return null;

  const query = `
    SELECT files.id, files.name, files.extension, tags.id AS tagId, tags.name AS tagName
    FROM files
    LEFT JOIN file_tags ON files.id = file_tags.file_id
    LEFT JOIN tags ON file_tags.tag_id = tags.id
    WHERE files.id = ?
  `;
  const [rows] = await pool.query<RowDataPacket[]>(query, [fileId]);

  if (rows.length === 0) return null;

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

export async function insertFile(file: Express.Multer.File, userId: string): Promise<TaggerFile | undefined> {
  const splitName = file.originalname.split('.');
  const name = splitName[0];
  const extension = splitName[1];

  await createUserIfNotExists(userId);

  const query = 'INSERT INTO files (name, extension) VALUES (?, ?)';
  const [result] = await pool.query<OkPacket>(query, [name, extension]);

  await setUserToFile(userId, result.insertId as number);

  return {
    id: result.insertId as number,
    name,
    extension,
  };
}

async function createUserIfNotExists(userId: string): Promise<void> {
  const query = `
    INSERT INTO users (id)
    VALUES (?)
    ON DUPLICATE KEY UPDATE id = id
  `;
  await pool.query(query, [userId]);
}

async function setUserToFile(userId: string, fileId: number): Promise<void> {
  const query = `
    INSERT INTO user_files (user_id, file_id)
    VALUES (?, ?)
  `;
  await pool.query(query, [userId, fileId]);
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

export async function getUserFiles (userId: string, page: number): Promise<TaggerFiles> {
  const offset = (page - 1) * config.filesPerPage;
  const query = `
    SELECT files.id, files.name, files.extension
    FROM files
    LEFT JOIN user_files ON files.id = user_files.file_id
    WHERE user_files.user_id = ?
    ORDER BY files.id DESC
    LIMIT ${config.filesPerPage}
    OFFSET ${offset}
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
  const taggerFiles = rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    extension: row.extension as string,
  }));
  // TODO: Fix total pages for user files
  const totalPages = await getTotalPages([]);
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

  const deleteUserFileQuery = 'DELETE FROM user_files WHERE file_id = ?';
  await pool.query(deleteUserFileQuery, [fileId]);

  const deleteFileQuery = 'DELETE FROM files WHERE id = ?';
  await pool.query(deleteFileQuery, [fileId]);
  return file;
}

export async function isFileOwner(userId: string, fileId: number): Promise<boolean> {
  const query = 'SELECT * FROM user_files WHERE user_id = ? AND file_id = ?';
  const [rows] = await pool.query<RowDataPacket[]>(query, [userId, fileId]);
  return rows.length > 0;
}

export async function getAllTags(): Promise<TaggerTags> {
  const query = `
    SELECT tags.id, tags.name, COUNT(file_tags.tag_id) AS count
    FROM tags
    LEFT JOIN file_tags ON tags.id = file_tags.tag_id
    GROUP BY tags.id
    ORDER BY count DESC, tags.name ASC
    LIMIT 10
  `;
  const [rows] = await pool.query<RowDataPacket[]>(query);
  const taggerTags = rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    count: row.count as number,
  }));
  return {
    tags: taggerTags,
  };
}

export async function getTopRelatedTags(tags: string[]): Promise<TaggerTags> {
  const placeholders = tags.map(() => '?').join(', ');

  const query = `
    SELECT file_id
    FROM file_tags
    WHERE tag_id IN (SELECT id FROM tags WHERE name IN (${placeholders}))
    GROUP BY file_id
    HAVING COUNT(DISTINCT tag_id) = ?
  `;
  const [rows] = await pool.query<RowDataPacket[]>(query, [...tags, tags.length]);
  const tagIds: number[] = rows.map((row) => row.file_id as number);

  if (tagIds.length === 0) {
    return { tags: [] };
  }
  const tagQuery = `
    SELECT tags.id, tags.name, COUNT(file_tags.tag_id) AS count
    FROM tags
    LEFT JOIN file_tags ON tags.id = file_tags.tag_id
    WHERE file_tags.file_id IN (${tagIds.join(', ')})
    GROUP BY tags.id
    ORDER BY count DESC, tags.name ASC
    LIMIT 10
  `;

  const [tagRows] = await pool.query<RowDataPacket[]>(tagQuery, [...tags, ...tags]);
  const taggerTags = tagRows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    count: row.count as number,
  }));

  return {
    tags: taggerTags,
  };
}




export async function clearDatabase(): Promise<void> {
  try {
    console.log("Clearing database")
    await pool.query('DELETE FROM user_files');
    await pool.query('DELETE FROM file_tags');
    await pool.query('DELETE FROM files');
    await pool.query('DELETE FROM tags');
    await pool.query('DELETE FROM users');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}
