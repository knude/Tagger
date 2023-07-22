import { Request } from "express";

export interface TaggerFile {
  id: number;
  name: string;
  extension: string;
}

export interface TaggerTag {
  id: number;
  name: string;
}

export interface TaggerFileWithTags extends TaggerFile {
  tags: TaggerTag[];
}

export interface TaggerFiles {
  files: TaggerFile[];
  totalPages: number;
}

export interface AuthRequest extends Request {
  userId?: string;
}