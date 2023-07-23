import { Response, Router } from 'express';
import { AuthRequest } from "../utils/types";
import { getUserId } from '../utils/authMiddleware';
import { isFileOwner } from "../utils/db";

const router = Router();

router.get('/:id/owner', async (req: AuthRequest, res: Response) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      res.json(false)
      return;
    }
    const userId = await getUserId(authorization);
    const id = Number(req.params.id);
    const isOwner = await isFileOwner(userId, id);
    res.json(isOwner);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

export default router;