<<<<<<< HEAD
import e from "express";
import { ContentDataType, Level, QuizType } from "./enums";

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
  orderNumber: string;
  contents?: {
    id?: string;
    translation: string;
    contentPath?: {
      contentType: ContentDataType;
      filePath: string;
    };
  }[];
  headLineTag?: string;
  languageId: string;
  estimatedDuration: number;
  createdAt: Date;
  totalContents?: number;
  outcomes?: string;
  objectives?: string;
  updatedAt?: Date;
}

export interface ContentAttributes {
  id: string;
  lessonId: string;
  lesson?: {
    name: string;
    description: string;
  }
  // languageContentId: string;
  languageContent?: {
    title: string;
    word: string;
    tone: string;
  };
  translation?: string;
  customText?: string;
  isGrammarRule?: boolean;
  key?: string;
  filePath?: {
    contentType: ContentDataType;
    filePath: string;
  }[];
  languageId: string;
  ededunPhrases?: string;
  sourceType: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileContentAttributes {
  id: string;
  contentId: string;
  filePath: string;
  fileType: ContentDataType;
}

=======
>>>>>>> ab3ecc7c706caae2a77db72b4d3074ce3755cd78
export interface LanguageContentAtrributes {
  id?: string;
  languageId: string;
  title?: string;
  word?: string;
  tone?: string;
  createdAt: Date;
  updatedAt?: Date;
}













