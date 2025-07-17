import { ContentDataType } from "./enums";

export interface LanguageAttributes {
  id?: string;
  code: string;
  title: string;
  isActive?: boolean;
}

export interface LessonAttributes {
  id?: string;
  title: string;
  description: string;
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
  id?: string;
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
  filePathId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LanguageContentAtrributes {
  id: string;
  languageId: string;
  title: string;
  word: string;
  tone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentFileAttributes {
  id: string;
  contentId: string;
  contentType: ContentDataType;
  filePath: string;
  createdAt: Date;
}