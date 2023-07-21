import { Request, Response, Router } from 'express';
import { getAllFiles, getFileWithTags, insertFile, insertTagsToFile, searchByTags } from "../utils/db";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { uploadObject } from "../utils/files";
import {TaggerFile} from "../utils/types";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (_req: Request, res: Response) => {
  const files = await getAllFiles();
  res.json(files);
});

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
  const { tags } = req.body;
  let files: TaggerFile[];
  if (tags.length === 0) {
    files = await getAllFiles();
  } else {
    files = await searchByTags(tags);
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

export default router;