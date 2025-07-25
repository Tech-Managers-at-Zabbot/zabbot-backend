import { Request, Response } from "express";
import { adminServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../utilities";
import { JwtPayload } from "jsonwebtoken";
import { CloudinaryResponse, CloudinaryResource } from "../../types/generalTypes";



const adminCreatePhrase = async (
  request: Request,
  response: Response
): Promise<any> => {

  const newPhrase: any = await adminServices.addPhrase(
    request.body
  );

  return responseUtilities.responseHandler(
    response,
    newPhrase.message,
    newPhrase.statusCode,
    newPhrase.data
  );
};


const adminCreatesManyPhrases = async (
  request: Request,
  response: Response
): Promise<any> => {

  const newPhrases: any = await adminServices.addManyPhrases(
    request.body
  );

  return responseUtilities.responseHandler(
    response,
    newPhrases.message,
    newPhrases.statusCode,
    newPhrases.data
  );
};

const adminUpdatesPhrase = async (
  request: Request,
  response: Response
): Promise<any> => {

  const { body } = request;

  const { phraseId } = request.params;

  const updateData = {
    body, phraseId
  }

  const updatedPhrase: any = await adminServices.updatePhrase(
    updateData
  );

  return responseUtilities.responseHandler(
    response,
    updatedPhrase.message,
    updatedPhrase.statusCode,
    updatedPhrase.data
  );
};


const adminDeletesPhrase = async (
  request: Request,
  response: Response
): Promise<any> => {

  const { phraseId } = request.params;

  const deletedPhrase: any = await adminServices.deletePhrase(
    phraseId
  );

  return responseUtilities.responseHandler(
    response,
    deletedPhrase.message,
    deletedPhrase.statusCode,
    deletedPhrase.data
  );
};


const adminDeletesCloudinaryLeftOverRecordings = async (
  request: Request,
  response: Response
): Promise<any> => {
  const cloudinaryFiles: CloudinaryResource[] = await adminServices.getAllClouinaryRecordingsService('Ededun/Audio');
  console.log(`Found1 ${cloudinaryFiles.length} files in Cloudinary`);

  const dbAudioFiles = await adminServices.getAllDatabaseAudioFilesService();
  console.log(`Found2 ${dbAudioFiles.length} audio files in database`);
  console.log('audioFiles', dbAudioFiles)

  const orphanedFiles: any = await adminServices.findOrphanedFilesService(cloudinaryFiles, dbAudioFiles);
  console.log(`Found3 ${orphanedFiles} orphaned files to delete`);

  const deletionResults = await adminServices.deleteOrphanedFilesService(orphanedFiles);


  return responseUtilities.responseHandler(
    response,
    'success',
    200,
    {
      stats: {
        totalCloudinaryFiles: cloudinaryFiles.length,
        totalDatabaseFiles: dbAudioFiles.length,
        orphanedFilesFound: orphanedFiles.length,
        deletedFiles: deletionResults.filter((r: any) => r.result === 'ok').length,
        failedDeletions: deletionResults.filter((r: any) => r.result !== 'ok').length
      },
      deletionResults
    }
  )
}

const adminGetsPhraseWithRecordingsForZabbot = async (
  request: Request,
  response: Response
): Promise<any> => {

  const { englishText, yorubaText } = request.query;

  if (!englishText && !yorubaText) {
    throw errorUtilities.createError("Either English Text or Yoruba Text must be provided", 400);
  }
  const fetchRecordings = await adminServices.getPhraseWithAllRecordingsForZabbot(
    englishText, yorubaText);

  return responseUtilities.responseHandler(
    response,
    fetchRecordings.message,
    fetchRecordings.statusCode,
    fetchRecordings.data
  )
};


const adminGetsPhraseWithRecordingsForZabbotBatch = async (
  request: Request,
  response: Response
): Promise<any> => {

  const { phrases } = request.query;

  if (!phrases) {
    throw errorUtilities.createError("Phrases must be provided", 400);
  }

  const phrasesArr = JSON.parse(phrases as string)

  if (!phrasesArr || !Array.isArray(phrasesArr) || phrasesArr.length === 0) {
    throw errorUtilities.createError("Phrases array must be provided and cannot be empty", 400);
  }

  for (const phrase of phrasesArr) {
    if (!phrase.englishText && !phrase.yorubaText) {
      throw errorUtilities.createError("Each phrase must have either englishText or yorubaText", 400);
    }
  }

  const fetchRecordings = await adminServices.getPhrasesWithAllRecordingsForZabbotParallel(phrasesArr);

  return responseUtilities.responseHandler(
    response,
    fetchRecordings.message,
    fetchRecordings.statusCode,
    fetchRecordings.data
  );
};

export default {
  adminCreatePhrase,
  adminUpdatesPhrase,
  adminDeletesPhrase,
  adminCreatesManyPhrases,
  adminDeletesCloudinaryLeftOverRecordings,
  adminGetsPhraseWithRecordingsForZabbot,
  adminGetsPhraseWithRecordingsForZabbotBatch
};
