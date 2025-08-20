import referenePronunciationRepositories from "../repositories/reference-pronunciation.repository";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";
import { v4 } from "uuid";
import { ResponseDetails } from "../../../shared/utilities/responseHandlers/response.utilities";
import { ReferencePronunciationAttributes } from "../../../shared/databaseTypes/pronunciation-feedback-types";
import { handleSinglePronunciation } from "../helpers/helpers";

const getPronunciations = errorUtilities.withServiceErrorHandling(async () => {
  const pronunciations =
    await referenePronunciationRepositories.getPronunciations();
  return responseUtilities.handleServicesResponse(
    StatusCodes.OK,
    "success",
    pronunciations
  );
});

const getPronunciation = errorUtilities.withServiceErrorHandling(
  async (id: string): Promise<ResponseDetails> => {
    const pronunciation =
      await referenePronunciationRepositories.getPronunciation(id);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "success",
      pronunciation
    );
  }
);

const addPronunciation = errorUtilities.withServiceErrorHandling(
  async (pronunciationData: ReferencePronunciationAttributes | ReferencePronunciationAttributes[]) => {

    if (Array.isArray(pronunciationData)) {
      const created: any[] = [];
      const updated: any[] = [];
      const failed: any[] = [];

      const results = await Promise.all(pronunciationData.map((data:any) => handleSinglePronunciation(data)));

      results.forEach((data) => {
        if (data.type === "created") created.push(data.result);
        else if (data.type === "updated") updated.push(data.result);
        else failed.push(data.result);
      });

      return responseUtilities.handleServicesResponse(
        StatusCodes.MultiStatus,
        "Pronunciations processed",
        { created, updated, failed }
      );
    } else {
      const result = await handleSinglePronunciation(pronunciationData);
      const message = result.type === "created"
        ? "Pronunciation created successfully"
        : result.type === "updated"
          ? "Pronunciation updated successfully"
          : "Failed to process pronunciation";

      const status = result.type === "error" ? StatusCodes.InternalServerError : StatusCodes.OK;

      return responseUtilities.handleServicesResponse(
        status,
        message,
        result.result
      );
    }
  }
);


const updatePronunciation = errorUtilities.withServiceErrorHandling(
  async (id: string, pronunciationData: ReferencePronunciationAttributes) => {
    const pronunciation =
      await referenePronunciationRepositories.getPronunciation(id);
    if (!pronunciation) {
      throw errorUtilities.createError(`Pronunciation not found`, 404);
    }

    const updatedPronunciation =
      await referenePronunciationRepositories.updatePronunciation(
        pronunciationData, {id}
      );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Pronunciation updated successfully",
      updatedPronunciation
    );
  }
);

const deletePronunciation = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const pronunciation =
      await referenePronunciationRepositories.getPronunciation(id);
    if (!pronunciation) {
      throw errorUtilities.createError(`Pronunciation not found`, 404);
    }

    await referenePronunciationRepositories.deletePronunciation(id);
    return responseUtilities.handleServicesResponse(
      StatusCodes.NoContent,
      "Pronunciation deleted successfully",
      null
    );
  }
);

export default {
  getPronunciations,
  getPronunciation,
  addPronunciation,
  updatePronunciation,
  deletePronunciation,
};
