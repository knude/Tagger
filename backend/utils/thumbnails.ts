import sharp from "sharp";
import tmp from "tmp";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

import ffmpegPath from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function generateImageThumbnail(file: Buffer): Promise<Buffer> {
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