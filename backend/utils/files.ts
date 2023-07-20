import sharp from "sharp";
import tmp from "tmp";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

import ffmpegPath from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(ffmpegPath.path);

import {Client} from "minio"

import config from "./config"

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

export async function getObject (filePath: string) {
  try {
    return await minioClient.getObject(bucketName, filePath);
  } catch (error) {
    throw error;
  }
}

async function generateImageThumbnail(file: Buffer): Promise<Buffer> {
  try {
    return await sharp(file)
      .resize({ width: 240 })
      .png()
      .toBuffer();
  } catch (error) {
    throw error;
  }
}

export async function generateVideoThumbnail(file: Buffer): Promise<Buffer> {
  try {
    // Save the video buffer to a temporary file
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, file);

    // Create a temporary location for the thumbnail
    const thumbnailFileLocation = tmp.tmpdir;
    const thumbnailFileName = `thumbnail.png`;

    // Extract frame from video
    await new Promise((resolve, reject) => {
      ffmpeg(tmpFile.name)
        .screenshots({
          timestamps: ["00:00:00"],
          filename: thumbnailFileName,
          folder: thumbnailFileLocation,
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const finalThumbnailFileName = `${thumbnailFileLocation}/${thumbnailFileName}`;
    const thumbnailFileBufferFromDisk = fs.readFileSync(finalThumbnailFileName);
    const thumbnail = await generateImageThumbnail(thumbnailFileBufferFromDisk);

    fs.unlinkSync(tmpFile.name);
    fs.unlinkSync(finalThumbnailFileName);

    return thumbnail;
  } catch (error) {
    throw error;
  }
}