import userPronunciationRepositories from "../repositories/user-pronunciation.repository";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";
import { UserPronunciationAttributes } from "../data-types/interface";
import { v4 } from "uuid";

const getPronunciations = errorUtilities.withServiceErrorHandling(async () => {
  const pronunciations =
    await userPronunciationRepositories.getPronunciations();
  return responseUtilities.handleServicesResponse(
    StatusCodes.OK,
    "success",
    pronunciations
  );
});

const getPronunciation = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const pronunciation = await userPronunciationRepositories.getPronunciation(
      id
    );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "success",
      pronunciation
    );
  }
);

const addPronunciation = errorUtilities.withServiceErrorHandling(
  async (pronunciationData: UserPronunciationAttributes) => {
    const newPronunciaitonData = {
      ...pronunciationData,
      id: v4(),
      createdAt: new Date(),
    };

    const newPronunciation =
      await userPronunciationRepositories.addPronunciation(
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
  async (id: string, pronunciationData: UserPronunciationAttributes) => {
    const pronunciation = await userPronunciationRepositories.getPronunciation(
      id
    );
    if (!pronunciation) {
      throw errorUtilities.createError(`Pronunciation not found`, 404);
    }

    const updatedPronunciation =
      await userPronunciationRepositories.updatePronunciation(
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
    const pronunciation = await userPronunciationRepositories.getPronunciation(
      id
    );
    if (!pronunciation) {
      throw errorUtilities.createError(`Pronunciation not found`, 404);
    }

    await userPronunciationRepositories.deletePronunciation(id);
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
