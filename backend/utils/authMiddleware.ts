import { auth } from "express-oauth2-jwt-bearer";
import { Response, NextFunction } from "express";
import config from "../utils/config";
import jwtDecode from "jwt-decode";
import { AuthRequest } from "./types";

const jwtCheck = auth({
  audience: config.auth0Audience,
  issuerBaseURL: config.auth0Issuer,
  tokenSigningAlg: config.auth0SigningAlg,
});

type AuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

const authMiddleware: AuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    jwtCheck(req, res, next);
    req.userId = await getUserId(req.headers.authorization as string);
  } catch (error) {
    next(error);
  }
};

export async function getUserId(token: string): Promise<string> {
  const decodedToken = jwtDecode(token) as { sub: string };
  return decodedToken.sub;
}

export default authMiddleware;
