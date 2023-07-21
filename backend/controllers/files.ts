import { Request, Response, Router } from 'express';
import {deleteFile, getAllFiles, getFileWithTags, insertFile, insertTagsToFile, searchForFiles} from "../utils/db";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import {deleteObject, uploadObject} from "../utils/files";
import { TaggerFiles } from "../utils/types";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:id", async (req: Request, res: Response) => {
  const file = await getFileWithTags(Number(req.params.id));
  if (file === null) {
    res.sendStatus(404);
  } else {
    res.json(file);
  }
});

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    file.originalname = `${uuidv4()}.${file.originalname.split(".").pop()}`;
    await uploadObject(file, file.originalname);
    const result = await insertFile(file);
    res.json(result).status(201);
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

router.post("/:id/tags", async (req: Request, res: Response) => {
  const { tags } = req.body;
  const lowerCaseTags = tags.map((tag: string) => tag.toLowerCase());
  const file = await insertTagsToFile(Number(req.params.id), lowerCaseTags);
  if (file === null) {
    res.sendStatus(404);
  } else {
    res.json(file);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const dbResult = await deleteFile(id);
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

export default router;