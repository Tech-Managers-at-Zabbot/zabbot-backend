import e from "express";
import { ContentDataType, Level, QuestionType } from "./enums";

export interface LanguageAttributes {
  id?: string;
  code: string;
  title: string;
  isActive?: boolean;
  flagIcon?: string;
}

export interface LessonAttributes {
  id?: string;
  title: string;
  description: string;
  courseId: string;
  contents?: {
    id?: string;
    translation: string;
    contentPath?: {
      contentType: ContentDataType;
      filePath: string;
    };
  }[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ContentAttributes {
  id: string;
  lessonId: string;
  lesson?: {
    name: string;
    description: string;
  }
  languageContentId: string;
  languageContent?: {
    title: string;
    word: string;
    tone: string;
  };
  translation?: string;
  level: Level;
  key?: string;
  filePath?: {
    contentType: ContentDataType;
    filePath: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileContentAttributes {
  id: string;
  contentId: string;
  filePath: string;
  fileType: ContentDataType;
}

export interface LanguageContentAtrributes {
  id?: string;
  languageId: string;
  title?: string;
  word?: string;
  tone?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ContentFileAttributes {
  id?: string;
  contentId: string;
  contentType: ContentDataType;
  filePath?: string;
  createdAt: Date;
}

export interface DailyWordAttributes {
  id: string;
  languageId: string;
  dateUsed?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  audioUrls: string[];
  languageText: string;
  englishText: string;
  isUsed: boolean;
}

export interface UserDailyGoalAttributes {
  id: string;
  userId: string;
  languageId?: string;
  isCompleted: boolean;
  percentageCompletion: string;
  createdAt?: Date;
  updatedAt?: Date;
  date: Date;
}

export interface CourseAttributes {
  id: string;
  title: string;
  description?: string;
  languageId: string;
  isActive: boolean;
  estimatedDuration?: number; // in minutes
  totalLessons?: number;
  thumbnailImage?: string;
  tags?: string[];
  prerequisites?: string[]; // course IDs
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserCourseAttributes {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
}

export interface QuestionAttributes {
  id: string;
  name: string;
  instruction?: string;
  type: QuestionType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OptionAttributes {
  id: string;
  questionId: string;
  name: string;
  isCorrect: boolean;
}

export interface LessonQuestionAttributes {
  id: string;
  lessonId: string;
  questionId: string;
}