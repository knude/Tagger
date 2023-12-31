import { Request, Response, Router } from 'express';
import multer from "multer";
import authMiddleware from "../utils/authMiddleware";
import {
  deleteFile, deleteTagFromFile,
  getAllFiles, getAllTags,
  getFileWithTags, getTopRelatedTags, getUserFiles,
  insertFile,
  insertTagsToFile,
  isFileOwner,
  searchForFiles
} from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { deleteObject, uploadObject } from "../utils/files";
import { AuthRequest, TaggerFiles } from "../utils/types";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/tags/all", async (_req: Request, res: Response) => {
  const tags = await getAllTags();
  res.json(tags);
});

router.get("/tags", async (req: Request, res: Response) => {
  const tags = req.query.tags ?? [];

  if (tags.length === 0) {
    const tags = await getAllTags();
    res.json(tags);
    return;
  }
  const lowerCaseTags = tags?.toString().split(",").map((tag: string) => tag.toLowerCase());
  const topTags = await getTopRelatedTags(lowerCaseTags);
  res.json(topTags)
});

router.get("/:id", async (req: Request, res: Response) => {
  const file = await getFileWithTags(Number(req.params.id));
  if (file === null) {
    res.sendStatus(404);
  } else {
    res.json(file);
  }
});

router.post("/", authMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;

    const file = req.file as Express.Multer.File;
    file.originalname = `${uuidv4()}.${file.originalname.split(".").pop()}`;

    await uploadObject(file, file.originalname);
    const result = await insertFile(file, userId);

    res.json(result).status(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const id = Number(req.params.id);

    const isOwner = await isFileOwner(userId,id);
    if (!isOwner) {
      res.sendStatus(401);
      return;
    }
    const dbResult = await deleteFile(id)
    if (!dbResult) {
      res.sendStatus(404);
      return;
    }

    const filePath = `${dbResult?.name}.${dbResult?.extension}`;
    const thumbnailPath = `/thumbnails/${filePath.split(".")[0]}.png`;
    await deleteObject(filePath);
    await deleteObject(thumbnailPath);

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.post("/:id/tags", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const id = Number(req.params.id);

    const isOwner = await isFileOwner(userId,id);
    if (!isOwner) {
      res.sendStatus(401);
      return;
    }

    const { tags } = req.body;
    const lowerCaseTags = tags.map((tag: string) => tag.toLowerCase());

    const file = await insertTagsToFile(id, lowerCaseTags);
    if (file === null) {
      res.sendStatus(404);
    } else {
      res.json(file);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.delete("/:id/tags/:tagId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const id = Number(req.params.id);

    const isOwner = await isFileOwner(userId,id);
    if (!isOwner) {
      res.sendStatus(401);
      return;
    }

    const tagId = Number(req.params.tagId);
    const file = await getFileWithTags(id);
    if (file === null) {
      res.sendStatus(404);
    } else {
      await deleteTagFromFile(id, tagId);
      res.json(file);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.post("/search", async (req: Request, res: Response) => {
  const { tags, page } = req.body;
  const lowerCaseTags = tags.map((tag: string) => tag.toLowerCase());

  let files: TaggerFiles;
  if (tags.length === 0) {
    files = await getAllFiles(page);
  } else {
    files = await searchForFiles(lowerCaseTags, page);
  }
  res.json(files);
});

router.post("/user", authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const { page } = req.body;
  const files = await getUserFiles(userId, page);
  res.json(files);
});


export default router;