import { Router, Request, Response } from 'express';
import { getObject } from "../utils/files";

const router = Router();

router.get("/*", async (req: Request, res: Response) => {
  try {

    const filePath: string = req.params[0];
    console.log(filePath)
    const dataStream = await getObject(filePath);

    if (dataStream) {
      dataStream.pipe(res);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
});

export default router;
