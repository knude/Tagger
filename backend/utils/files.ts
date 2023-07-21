import {Client} from "minio"
import config from "./config"
import { generateImageThumbnail, generateVideoThumbnail } from "./thumbnails";

const bucketName = "tagger-bucket";

const minioClient = new Client({
  endPoint: config.minioEndPoint,
  port: config.minioPort,
  accessKey: config.minioAccessKey,
  secretKey: config.minioSecretKey,
  useSSL: false,
})

export async function initializeBucket() {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Created new bucket ${bucketName}`);
    }
    console.log(`Using bucket ${bucketName}`);
  } catch (error) {
    console.error("Error initializing the bucket:", error);
  }
}

export async function uploadObject (file: Express.Multer.File, filePath: string) {
  try {
    const allowedFile = config.allowedFiles.includes(file.mimetype);
    if (!allowedFile) {
      throw new Error("File type not allowed");
    }

    const mimeType = file.mimetype.split("/")[0];
    const thumbnailPath = `/thumbnails/${filePath.split(".")[0]}.png`;
    if (mimeType === "video") {
      const thumbnail = await generateVideoThumbnail(file.buffer);
      await minioClient.putObject(bucketName, thumbnailPath, thumbnail);
    } else if (mimeType === "image") {
      const thumbnail = await generateImageThumbnail(file.buffer);
      await minioClient.putObject(bucketName, thumbnailPath, thumbnail);
    }

    const uploadedFile = await minioClient.putObject(bucketName, filePath, file.buffer)
    console.log(`Uploaded file ${uploadedFile}`);
  } catch (error) {
    throw error;
  }
}

export const deleteObject = async (filePath: string): Promise<boolean> => {
  try {
    await minioClient.removeObject(bucketName, filePath);
    return true;
  } catch (error) {
    throw error;
  }
}

export async function getObject (filePath: string) {
  try {
    return await minioClient.getObject(bucketName, filePath);
  } catch (error) {
    throw error;
  }
}
