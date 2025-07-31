import { QuestionAttributes,  LessonQuestionAttributes } from "../../data-types/interface"
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import questionRepositories from "../../repositories/question.repository"
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { v4 } from "uuid";


const getQuestions = errorUtilities.withServiceErrorHandling(
  async (query?: {lessonId: string}) => {
    const questions = await questionRepositories.getQuestions(query);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", questions);
  }
);

const getQuestion = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const question = await questionRepositories.getQuestion(id);
    if (!question) {
      throw errorUtilities.createError(`Question not found`, 404);
    }

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "success", question);
  }
);

const addQuestion = errorUtilities.withServiceErrorHandling(
  async (questionData: any) => {
    const payload = {
      ...questionData, 
      id: v4()
    };

    const newQuestion = await questionRepositories.addQuestion(payload);

    if (questionData.lessonId) {
      const mapPayload = {
        lessonId: questionData.lessonId,
        questionId: newQuestion.id
      };

      await questionRepositories.mapLessonToQuestion(mapPayload);
    }
    return responseUtilities.handleServicesResponse(StatusCodes.Created, "Question created successfully", newQuestion);
  }
);

const updateQuestion = errorUtilities.withServiceErrorHandling(
  async (id: string, questionData: QuestionAttributes) => {
    const question = await questionRepositories.getQuestion(id);
    if (!question) {
      throw errorUtilities.createError(`Question not found`, 404);
    }

    question.name = questionData.name;
    question.instruction = questionData.instruction;
    question.type = questionData.type;

    const updatedQuestion = await questionRepositories.updateQuestion(id, question);
    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Q updated successfully", updatedQuestion);
  }
);

const deleteQuestion = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const question = await questionRepositories.getQuestion(id);
    if (!question)
      throw errorUtilities.createError(`Question not found`, 404);
    
    // check if this question has been mapped to a lesson
    const filter = {
      lessonId: undefined,
      questionId: question.id
    };

    const check = await questionRepositories.getLessonToQuestionMap(filter);
    if (check && check.length == 1)
      await questionRepositories.deleteLessonToQuestionMap(check[0].id)
    
    if (check && check.length > 1)
      throw errorUtilities.createError(`This question is mapped to more than one lessons. kindly remove mapped question`, 500);

    await questionRepositories.deleteQuestion(id);
    return responseUtilities.handleServicesResponse(StatusCodes.NoContent, "Question deleted successfully", null);
  }
);

const mapQuestionToLesson = errorUtilities.withServiceErrorHandling(
  async (data: LessonQuestionAttributes) => {
    const payload = {
      ...data,
      id: v4()
    };
 
    const newLessonQuestionMap = await questionRepositories.mapLessonToQuestion(payload);
    return responseUtilities.handleServicesResponse(StatusCodes.Created, "Mapping Lesson to Question created successfully", newLessonQuestionMap);
  }
);

const deleteQuestionToLessonMap = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    await questionRepositories.deleteLessonToQuestionMap(id);
    return responseUtilities.handleServicesResponse(StatusCodes.NoContent, "MappedQuestionToLesson deleted successfully", null);
  }
);

const mapQuestionToContent = errorUtilities.withServiceErrorHandling(
  async (data: LessonQuestionAttributes) => {
    const payload = {
      ...data,
      id: v4()
    };
 
    const newContentQuestionMap = await questionRepositories.mapContentToQuestion(payload);
    return responseUtilities.handleServicesResponse(StatusCodes.Created, "Mapping Content to Question created successfully", newContentQuestionMap);
  }
);

const deleteQuestionToContentMap = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    await questionRepositories.deleteContentToQuestionMap(id);
    return responseUtilities.handleServicesResponse(StatusCodes.NoContent, "MappedQuestionToContent deleted successfully", null);
  }
);

export default {
  getQuestions,
  getQuestion,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  mapQuestionToLesson,
  deleteQuestionToLessonMap,
  mapQuestionToContent,
  deleteQuestionToContentMap
}