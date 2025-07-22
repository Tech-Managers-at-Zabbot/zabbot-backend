import { Request, Response } from "express";
import { userServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../utilities";
import { JwtPayload } from "jsonwebtoken";


const userAddsRecording = async (
    request: JwtPayload,
    response: Response
): Promise<any> => {

    const { id } = request.user;

    const phraseId = request.body.phraseId;

    const audioFile = request.files?.audio?.[0]

    if (!audioFile) {
        throw errorUtilities.createError(
            'No audio file recorded',
            400
        )
    }

    const recordingUrl = audioFile.path;

    const payload = {
        userId: id,
        phraseId,
        recordingUrl
    }

    const newRecording: any = await userServices.addRecording(
        payload
    );

    return responseUtilities.responseHandler(
        response,
        newRecording.message,
        newRecording.statusCode,
        newRecording.data
    );
};

const userGetsAllTheirRecordings = async (
    request: JwtPayload,
    response: Response
): Promise<any> => {

    const { id } = request.user;

    const { page } = request.query;

    const userRecordings: any = await userServices.getAllMyRecordings(
        id, page
    );

    return responseUtilities.responseHandler(
        response,
        userRecordings.message,
        userRecordings.statusCode,
        userRecordings.data
    );
};

const userGetsUnrecordedPhrases = async (
    request: JwtPayload,
    response: Response
): Promise<any> => {

    const { id } = request.user

    const { page } = request.query;

    const unrecordedPhrases: any = await userServices.getAllMyUnrecordedPhrases(
        id, page
    );

    return responseUtilities.responseHandler(
        response,
        unrecordedPhrases.message,
        unrecordedPhrases.statusCode,
        unrecordedPhrases.data
    );
};

const userDeletesSingleRecording = async (
    request: JwtPayload,
    response: Response
): Promise<any> => {

    const { recordingId } = request.params

    const unrecordedPhrases: any = await userServices.deleteMyRecordings(
        recordingId
    );

    return responseUtilities.responseHandler(
        response,
        unrecordedPhrases.message,
        unrecordedPhrases.statusCode,
        unrecordedPhrases.data
    );
};


export default {
    userAddsRecording,
    userGetsAllTheirRecordings,
    userGetsUnrecordedPhrases,
    userDeletesSingleRecording
};
