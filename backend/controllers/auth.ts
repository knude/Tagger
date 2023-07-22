import { Response, Router } from 'express';
import { AuthRequest } from "../utils/types";
import authMiddleware from '../utils/authMiddleware';
import { isFileOwner } from "../utils/db";

const router = Router();

router.get('/:id/owner', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const fileId = Number(req.params.id);
    const isOwner = await isFileOwner(userId, fileId);
    res.json(isOwner);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

export default router;