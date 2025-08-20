export enum ContentDataType {
    // TEXT = 'text',
    VIDEO = 'video',
    AUDIO = 'audio',
    IMAGE = 'image',
}

export interface ContentFileAttributes {
  id?: string;
  contentId: string;
  contentType: ContentDataType;
  description?: string;
  filePath?: string;
  createdAt: Date;
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
  isGrammarRule?: boolean
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

export enum ContentSourceType {
  NEW = 'new',
  EDEDUN = 'ededun'
}

export enum Level {
    FOUNDATION = 'foundation',
    BUILDER = 'builder',
    EXPLORER = 'explorer',
}

export interface CourseAttributes {
  id: string;
  title: string;
  description?: string;
  languageId: string;
  isActive: boolean;
  level: Level
  estimatedDuration?: number;
  totalLessons?: number;
  totalContents?: number;
  thumbnailImage?: string;
  tags?: string[];
  prerequisites?: string[]; // course IDs
  createdAt: Date;
  updatedAt?: Date;
}

export enum LanguageCode {
    ENGLISH = 'EN',
    SPANISH = 'ES',
    FRENCH = 'FR',
    GERMAN = 'DE',
    ITALIAN = 'IT',
    PORTUGUESE = 'PT',
    MANDARIN = 'ZH',
    JAPANESE = 'JA',
    KOREAN = 'KO',
    ARABIC = 'AR',
    RUSSIAN = 'RU',
    HINDI = 'HI',
    YORUBA = 'YO',
    IGBO = 'IG',
    HAUSA = 'HA',
    SWAHILI = 'SW'
}


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

export interface QuizAttributes {
  id: string;
  courseId: string;
  lessonId?: string;
  contentId?: string;
  languageId: string;
  quizType: QuizType;
  instruction: string;
  question: string;
  options?: string[];
  correctOption?: string;
  correctAnswer?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export enum QuizType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_BLANK = 'FILL_IN_BLANK'
}


export interface UserCourseAttributes {
  id: string;
  userId: string;
  courseId: string;
  isCompleted: boolean;
  lastAccessed?: Date;
  progress?: number;
  lastLessonId?: string;
  lastContentId?: string;
  languageId: string;
  isActive: boolean
}


export interface UserQuizAnswerAttributes {
  id: string;
  userId: string;
  quizId: string;
  courseId: string;
  lessonId?: string;
  contentId?: string;
  userAnswer: string;
  isCorrect: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserDailyGoalAttributes {
  id: string;
  userId: string;
  languageId?: string;
  isCompleted: boolean;
  percentageCompletion: number;
  createdAt?: Date;
  updatedAt?: Date;
  date: Date;
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
  pronunciationNote?: string;
}