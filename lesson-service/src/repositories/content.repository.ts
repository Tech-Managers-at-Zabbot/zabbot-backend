import Contents from "src/entities/content"
import { errorUtilities } from "../../../shared/utilities";

getContents: async () => {
  try {
    const contents = await Contents.findAll();
  
    return contents;
  } catch (error: any) {
    throw errorUtilities.createError(`Error fetching contents ${error.message}`, 500);
  }
}

getLessonContents: async (lessonId: string) => {
  try {
    const lesson = await Contents.findByPk(lessonId);
    if (!lesson)
      throw errorUtilities.createError(`Lesson does not exist`, 500);

    const contents = await Contents.findAll({ where: { lessonId } });
  
    return contents;
    
  } catch (error: any) {
    throw errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
  }
}