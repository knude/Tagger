import { Router } from 'express';
import {getAllFiles, getFileWithTags, insertFile, searchByTags} from "../utils/db";
import multer from "multer";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (_req, res) => {
  const files = await getAllFiles();
  res.json(files);
});

router.get("/:id", async (req,  res) => {
  const file = await getFileWithTags(Number(req.params.id));
  if (file === null) {
    res.sendStatus(404);
  } else {
    res.json(file);
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file as Express.Multer.File;
  console.log("File:", file)
  const result = await insertFile(file);
  res.json(result);
});

router.post("/search", async (req, res) => {
  const { tags } = req.body;
  const files = await searchByTags(tags);
  console.log("Files:", files)
  res.json(files);
});

export default router;