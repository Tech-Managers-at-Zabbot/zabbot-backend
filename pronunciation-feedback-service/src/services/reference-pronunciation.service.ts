import referenePronunciationRepositories from "../repositories/reference-pronunciation.repository";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";
import { ReferencePronunciationAttributes } from "../data-types/interface";
import { v4 } from "uuid";
import { ResponseDetails } from "../../../shared/utilities/responseHandlers/response.utilities";

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
  async (pronunciationData: ReferencePronunciationAttributes) => {
    const newPronunciaitonData = {
      ...pronunciationData,
      id: v4(),
      createdAt: new Date(),
    };

    const newPronunciation =
      await referenePronunciationRepositories.addPronunciation(
        newPronunciaitonData
      );
    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      "Pronunciation created successfully",
      newPronunciation
    );
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
        pronunciationData
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
