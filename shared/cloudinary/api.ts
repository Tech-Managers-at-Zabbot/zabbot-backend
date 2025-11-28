import { StatusCodes } from "../statusCodes/statusCodes.responses";
import { errorUtilities, responseUtilities } from "../utilities";
import { CloudinaryService } from "./server";
import { BulkUploadResponse, MediaType } from "./types";

export const uploadFile = async (
  category: string,
  mediaType: string,
  files: Record<string, any>[]
) => {
  const uploadResponse = {
    status: "",
    message: "",
    data: {},
  };
  try {
    if (!["image", "video"].includes(mediaType)) {
      uploadResponse.status = "invalid";
      uploadResponse.message = "Invalid media type";
      return uploadResponse;
    }

    const result: BulkUploadResponse = {
      successful: [],
      failed: [],
    };

    for (const file of files) {
      try {
        const uploadResponse = await CloudinaryService.uploadFile(
          file.buffer,
          file.originalname,
          category,
          mediaType as MediaType
        );
        result.successful.push(uploadResponse);
      } catch (error) {
        result.failed.push({
          file: file.originalname,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (!result.successful.length) {
      uploadResponse.status = "error";
      uploadResponse.message = "Upload failed, please try again";
      uploadResponse.data = result;
      return uploadResponse;
    }

    if (!result.failed.length) {
      uploadResponse.status = "success";
      uploadResponse.message = "Process Successful";
      uploadResponse.data = result;
      return uploadResponse;
    }

    uploadResponse.status = "mixed";
    uploadResponse.message = "Process Partially Successful";
    uploadResponse.data = result;
    return uploadResponse;
  } catch (error) {
    console.log(error);
    uploadResponse.status = "error";
    uploadResponse.message =
      error instanceof Error
        ? error.message
        : "Upload failed, please try again";
    return uploadResponse;
  }
};

export const getSignature = async (folder, mediaType) => {
  const signatureResponse = {
    status: "",
    message: "",
    data: {},
  };
  try {
    if (!folder || !mediaType) {
      signatureResponse.message = "Missing folder or mediaType";
      signatureResponse.status = "error";
      return signatureResponse;
    }

    const signature = CloudinaryService.generateUploadSignature(
      folder,
      mediaType as MediaType
    );

    signatureResponse.message = "Successful";
    signatureResponse.status = "success";
    signatureResponse.data = signature;
    return signatureResponse;
  } catch (error) {
    signatureResponse.message =
      error instanceof Error ? error.message : "Token generation failed";
    signatureResponse.status = "error";
    return signatureResponse;
  }
};
