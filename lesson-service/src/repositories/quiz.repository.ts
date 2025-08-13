import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Quiz from "../entities/quiz";
// import LanguageContents from "../entities/language-content";


const quizRepositories = {

	getQuizzes: async (filter: Record<string, any>, isActive: boolean = true) => {
		try {
			const where: any = {
				...filter,
				// isActive,
			};
			const quizzes = await Quiz.findAll({ where: where, raw: true, order: [['createdAt', 'DESC']] });

			return quizzes;
		} catch (error: any) {
			throw errorUtilities.createError(`Error fetching quizzes: ${error.message}`, 500);
		}
	},

	getQuiz: async (id: string) => {
		try {
			const quiz = await Quiz.findByPk(id);

			return quiz;

		} catch (error: any) {
			throw errorUtilities.createError(`Error fetching Quiz: ${error.message}`, 500);
		}
	},

	addQuiz: async (quizData: Record<string, any> | any, transaction?: Transaction) => {
		try {
			const newQuiz = await Quiz.create(quizData, { transaction });

			return newQuiz;

		} catch (error: any) {
			throw errorUtilities.createError(`Error adding quiz: ${error.message}`, 500);
		}
	},

	updateQuiz: async (quizData: Record<string, any> | any, transaction?: Transaction) => {
		try {
			await quizData.update(quizData, { transaction });

			return quizData;

		} catch (error: any) {
			throw errorUtilities.createError(`Error updating quiz: ${error.message}`, 500);
		}
	},

	deleteQuiz: async (id: string) => {
		try {
			await Quiz.destroy({ where: { id } });

			return { message: "Quiz deleted successfully" };

		} catch (error: any) {
			throw errorUtilities.createError(`Error deleting quiz: ${error.message}`, 500);
		}
	}
}

export default quizRepositories;