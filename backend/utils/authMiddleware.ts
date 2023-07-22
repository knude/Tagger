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
    const decoded: { sub: string } = jwtDecode(req.headers.authorization?.split(" ")[1] ?? "");
    req.userId = decoded.sub;
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
