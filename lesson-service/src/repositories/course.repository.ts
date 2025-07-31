import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Courses from "../entities/course";
<<<<<<< HEAD
=======
// import LanguageContents from "../entities/language-content";

>>>>>>> b059e1b24c77fc4a9d2566d6187e0933b861c4d9

const courseRepositories = {
	getCourses: async (isActive: boolean = true, languageId: string) => {
		try {
			const where: any = {
				isActive,
				languageId
			};
			const courses = await Courses.findAll({where:where});

			return courses;
		} catch (error: any) {
			throw errorUtilities.createError(`Error Fetching courses: ${error.message}`, 500);
		}
	},

	getCourse: async (id: string) => {
		try {
			const course = await Courses.findByPk(id);

			return course;

		} catch (error: any) {
			throw errorUtilities.createError(`Error Fetching course: ${error.message}`, 500);
		}
	},

	getCourseByTitle: async (title: string) => {
		try {
			const course = await Courses.findOne({ where: { title } });

			return course;

		} catch (error: any) {
			throw errorUtilities.createError(`Error Fetching course by title: ${error.message}`, 500);
		}
	},

	addCourse: async (courseData: any, transaction?: Transaction) => {
		try {
			// Create a new course
			const newCourse = await Courses.create(courseData, { transaction });

			return newCourse;

		} catch (error: any) {
			throw errorUtilities.createError(`Error Adding course: ${error.message}`, 500);
		}
	},

	updateCourse: async (courseData: any, transaction?: Transaction) => {
		try {
			// Update the course
			await courseData.update(courseData, { transaction });

			return courseData;

		} catch (error: any) {
			throw errorUtilities.createError(`Error Updating course: ${error.message}`, 500);
		}
	},

	deleteCourse: async (id: string) => {
		try {
			await Courses.destroy({ where: { id } });

			return { message: "Course deleted successfully" };

		} catch (error: any) {
			throw errorUtilities.createError(`Error Deleting course: ${error.message}`, 500);
		}
	}
}

export default courseRepositories;