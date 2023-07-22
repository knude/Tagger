import { auth } from "express-oauth2-jwt-bearer";
import config from "../utils/config";
import { Request, Response, NextFunction } from "express"; // Import the correct Request type

const jwtCheck = auth({
  audience: config.auth0Audience,
  issuerBaseURL: config.auth0Issuer,
  tokenSigningAlg: config.auth0SigningAlg,
});

const authMiddleware = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    await jwtCheck(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
