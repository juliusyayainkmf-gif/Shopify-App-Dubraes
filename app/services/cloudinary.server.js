import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFromBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadConfiguratorImage = (buffer, configId) =>
  uploadFromBuffer(buffer, {
    resource_type: "image",
    folder: "configs/images",
    public_id: `img-${configId}-${Date.now()}`,
    transformation: [
      { width: 1200, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });

export const uploadConfiguratorPdf = (buffer, configId) =>
  uploadFromBuffer(buffer, {
    resource_type: "image",
    folder: "configs",
    public_id: configId,
    type: "upload",
    access_mode: "public",
    format: "pdf",
  });

export const listCloudinaryResources = () =>
  cloudinary.api.resources({
    max_results: 1000,
  });

export const deleteCloudinaryResource = (publicId) =>
  cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

export const renameCloudinaryResource = (publicId, newPublicId) =>
  cloudinary.uploader.rename(publicId, newPublicId, {
    resource_type: "image",
    overwrite: true,
  });
