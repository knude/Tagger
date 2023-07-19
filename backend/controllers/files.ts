import { Router } from 'express';
import {getAllFiles, getFileWithTags} from "../utils/db";

const router = Router();

router.get("/", async (_req, res) => {
  const files = await getAllFiles();
  res.json(files);
});

router.get("/:id", async (req, res) => {
  const file = await getFileWithTags(Number(req.params.id));
  if (file === null) {
    res.sendStatus(404);
  } else {
    res.json(file);
  }
});

export default router;