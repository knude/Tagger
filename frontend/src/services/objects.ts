import { TaggerFile } from "../utils/types";

const apiUrl = 'http://localhost:3001/api/objects';

export const getThumbnailURL = (file: TaggerFile): string => {
  return `${apiUrl}/thumbnails/${file.name}.png`;
}

export const getObjectURL = (file: TaggerFile): string => {
  return `${apiUrl}/${file.name}.${file.extension}`;
}