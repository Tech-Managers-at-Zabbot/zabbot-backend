import courseRepositories from "../../repositories/course.repository";
import { errorUtilities } from "../../../../shared/utilities";

const getCourses = errorUtilities.withServiceErrorHandling (
  async (isActive?: boolean) => {
    const payload = { isActive };
    const courses = await courseRepositories.getCourses(payload);

    return courses;
  }
);

const getCourse = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const course = await courseRepositories.getCourse(id);
    if (!course) {
        throw errorUtilities.createError(`Course not found`, 404);
    }

    return course;
  }
);

const getCourseByTitle = errorUtilities.withServiceErrorHandling (
  async (title: string) => {
    const course = await courseRepositories.getCourseByTitle(title);
    if (!course) {
        throw errorUtilities.createError(`Course with title ${title} not found`, 404);
    }

    return course;
  }
);

const addCourse = errorUtilities.withServiceErrorHandling (
  async (courseData: any) => {
    const existingCourse = await courseRepositories.getCourseByTitle(courseData.title);
    if (existingCourse) {
        throw errorUtilities.createError(`Course with title ${courseData.title} already exists`, 400);
    }

    const newCourse = await courseRepositories.addCourse(courseData);
    return newCourse;
  }
);

const updateCourse = errorUtilities.withServiceErrorHandling (
  async (id: string, courseData: any) => {
    const course = await courseRepositories.getCourse(id);
    if (!course) {
        throw errorUtilities.createError(`Course not found`, 404);
    }

    // Update the course with new data
    Object.assign(course, courseData);
    const updatedCourse = await courseRepositories.updateCourse(course);
    return updatedCourse;
  }
);

const deleteCourse = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    await courseRepositories.deleteCourse(id);
    
    return { message: "Course deleted successfully" };
  }
);

export default {
  getCourses,
  getCourse,
  getCourseByTitle,
  addCourse,
  updateCourse,
  deleteCourse
};