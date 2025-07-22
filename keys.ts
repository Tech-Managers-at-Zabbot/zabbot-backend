import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';

// ==================== ENUMS AND TYPES ====================

enum LanguageCode {
    ENGLISH = 'en',
    SPANISH = 'es',
    FRENCH = 'fr',
    GERMAN = 'de',
    ITALIAN = 'it',
    PORTUGUESE = 'pt',
    MANDARIN = 'zh',
    JAPANESE = 'ja',
    KOREAN = 'ko',
    ARABIC = 'ar',
    RUSSIAN = 'ru',
    HINDI = 'hi',
    YORUBA = 'yo',
    IGBO = 'ig',
    HAUSA = 'ha',
    SWAHILI = 'sw'
}

enum ProficiencyLevel {
    BEGINNER = 'beginner',
    ELEMENTARY = 'elementary',
    INTERMEDIATE = 'intermediate',
    UPPER_INTERMEDIATE = 'upper_intermediate',
    ADVANCED = 'advanced',
    NATIVE = 'native'
}

enum LessonType {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    LISTENING = 'listening',
    SPEAKING = 'speaking',
    READING = 'reading',
    WRITING = 'writing',
    PRONUNCIATION = 'pronunciation',
    CULTURE = 'culture'
}

enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
    FILL_IN_BLANK = 'fill_in_blank',
    MATCHING = 'matching',
    ORDERING = 'ordering',
    SPEAKING = 'speaking',
    LISTENING = 'listening',
    TRANSLATION = 'translation'
}

enum ActivityType {
    LESSON_START = 'lesson_start',
    LESSON_COMPLETE = 'lesson_complete',
    QUIZ_ATTEMPT = 'quiz_attempt',
    QUIZ_COMPLETE = 'quiz_complete',
    WORD_OF_DAY_VIEW = 'word_of_day_view',
    WORD_OF_DAY_AUDIO = 'word_of_day_audio',
    DAILY_GOAL_COMPLETE = 'daily_goal_complete',
    STREAK_MILESTONE = 'streak_milestone',
    BADGE_EARNED = 'badge_earned',
    COURSE_COMPLETE = 'course_complete',
    LOGIN = 'login',
    PROFILE_UPDATE = 'profile_update'
}

enum BadgeType {
    STREAK = 'streak',
    LESSON_COMPLETION = 'lesson_completion',
    QUIZ_PERFORMANCE = 'quiz_performance',
    CONSISTENCY = 'consistency',
    ACHIEVEMENT = 'achievement',
    MILESTONE = 'milestone',
    SPECIAL = 'special'
}

enum GoalFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

// ==================== LANGUAGES MODEL ====================

interface LanguageAttributes {
    id: string;
    name: string;
    code: LanguageCode;
    nativeName: string;
    flagIcon?: string;
    isActive: boolean;
    description?: string;
    totalCourses?: number;
    totalLessons?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class Languages extends Model<LanguageAttributes> implements LanguageAttributes {
    public id!: string;
    public name!: string;
    public code!: LanguageCode;
    public nativeName!: string;
    public flagIcon?: string;
    public isActive!: boolean;
    public description?: string;
    public totalCourses?: number;
    public totalLessons?: number;
}

Languages.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.ENUM(...Object.values(LanguageCode)),
        allowNull: false,
        unique: true,
    },
    nativeName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    flagIcon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    totalCourses: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    totalLessons: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
}, {
    sequelize: users_service_db,
    modelName: 'Languages',
    tableName: 'languages',
    timestamps: true,
});

// ==================== USER LANGUAGE SUBSCRIPTIONS ====================

interface UserLanguageSubscriptionAttributes {
    id: string;
    userId: string;
    languageId: string;
    currentLevel: ProficiencyLevel;
    targetLevel: ProficiencyLevel;
    isActive: boolean;
    subscribedAt: Date;
    lastAccessedAt?: Date;
    totalTimeSpent?: number; // in minutes
    currentStreak?: number;
    longestStreak?: number;
    totalLessonsCompleted?: number;
    totalQuizzesCompleted?: number;
    averageQuizScore?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class UserLanguageSubscriptions extends Model<UserLanguageSubscriptionAttributes> implements UserLanguageSubscriptionAttributes {
    public id!: string;
    public userId!: string;
    public languageId!: string;
    public currentLevel!: ProficiencyLevel;
    public targetLevel!: ProficiencyLevel;
    public isActive!: boolean;
    public subscribedAt!: Date;
    public lastAccessedAt?: Date;
    public totalTimeSpent?: number;
    public currentStreak?: number;
    public longestStreak?: number;
    public totalLessonsCompleted?: number;
    public totalQuizzesCompleted?: number;
    public averageQuizScore?: number;
}

UserLanguageSubscriptions.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
    currentLevel: {
        type: DataTypes.ENUM(...Object.values(ProficiencyLevel)),
        allowNull: false,
        defaultValue: ProficiencyLevel.BEGINNER,
    },
    targetLevel: {
        type: DataTypes.ENUM(...Object.values(ProficiencyLevel)),
        allowNull: false,
        defaultValue: ProficiencyLevel.INTERMEDIATE,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    subscribedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    totalTimeSpent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    currentStreak: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    longestStreak: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    totalLessonsCompleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    totalQuizzesCompleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    averageQuizScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserLanguageSubscriptions',
    tableName: 'user_language_subscriptions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'languageId'],
        },
    ],
});

// ==================== COURSES MODEL ====================

interface CourseAttributes {
    id: string;
    languageId: string;
    title: string;
    description?: string;
    level: ProficiencyLevel;
    orderIndex: number;
    isActive: boolean;
    estimatedDuration?: number; // in minutes
    totalLessons?: number;
    thumbnailImage?: string;
    tags?: string[];
    prerequisites?: string[]; // course IDs
    createdAt?: Date;
    updatedAt?: Date;
}

class Courses extends Model<CourseAttributes> implements CourseAttributes {
    public id!: string;
    public languageId!: string;
    public title!: string;
    public description?: string;
    public level!: ProficiencyLevel;
    public orderIndex!: number;
    public isActive!: boolean;
    public estimatedDuration?: number;
    public totalLessons?: number;
    public thumbnailImage?: string;
    public tags?: string[];
    public prerequisites?: string[];
}

Courses.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    level: {
        type: DataTypes.ENUM(...Object.values(ProficiencyLevel)),
        allowNull: false,
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    estimatedDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    totalLessons: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    thumbnailImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    prerequisites: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'Courses',
    tableName: 'courses',
    timestamps: true,
});

// ==================== LESSONS MODEL ====================

interface LessonAttributes {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    type: LessonType;
    orderIndex: number;
    content: any; // JSON content structure
    isActive: boolean;
    estimatedDuration?: number; // in minutes
    hasQuiz: boolean;
    totalQuestions?: number;
    passingScore?: number;
    audioFiles?: string[]; // URLs to audio files
    videoFiles?: string[]; // URLs to video files
    images?: string[]; // URLs to images
    createdAt?: Date;
    updatedAt?: Date;
}

class Lessons extends Model<LessonAttributes> implements LessonAttributes {
    public id!: string;
    public courseId!: string;
    public title!: string;
    public description?: string;
    public type!: LessonType;
    public orderIndex!: number;
    public content!: any;
    public isActive!: boolean;
    public estimatedDuration?: number;
    public hasQuiz!: boolean;
    public totalQuestions?: number;
    public passingScore?: number;
    public audioFiles?: string[];
    public videoFiles?: string[];
    public images?: string[];
}

Lessons.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id',
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(LessonType)),
        allowNull: false,
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    content: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    estimatedDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    hasQuiz: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    passingScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 70,
    },
    audioFiles: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    videoFiles: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'Lessons',
    tableName: 'lessons',
    timestamps: true,
});

// ==================== QUIZ QUESTIONS MODEL ====================

interface QuizQuestionAttributes {
    id: string;
    lessonId: string;
    questionText: string;
    questionType: QuestionType;
    options?: any; // JSON structure for different question types
    correctAnswer: any; // JSON structure for correct answers
    explanation?: string;
    points: number;
    orderIndex: number;
    audioFile?: string;
    imageFile?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class QuizQuestions extends Model<QuizQuestionAttributes> implements QuizQuestionAttributes {
    public id!: string;
    public lessonId!: string;
    public questionText!: string;
    public questionType!: QuestionType;
    public options?: any;
    public correctAnswer!: any;
    public explanation?: string;
    public points!: number;
    public orderIndex!: number;
    public audioFile?: string;
    public imageFile?: string;
    public isActive!: boolean;
}

QuizQuestions.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    lessonId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id',
        },
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    questionType: {
        type: DataTypes.ENUM(...Object.values(QuestionType)),
        allowNull: false,
    },
    options: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    correctAnswer: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    audioFile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    imageFile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'QuizQuestions',
    tableName: 'quiz_questions',
    timestamps: true,
});

// ==================== USER LESSON PROGRESS ====================

interface UserLessonProgressAttributes {
    id: string;
    userId: string;
    lessonId: string;
    isStarted: boolean;
    isCompleted: boolean;
    currentSection?: string;
    progressPercentage: number;
    timeSpent: number; // in minutes
    startedAt?: Date;
    completedAt?: Date;
    lastAccessedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

class UserLessonProgress extends Model<UserLessonProgressAttributes> implements UserLessonProgressAttributes {
    public id!: string;
    public userId!: string;
    public lessonId!: string;
    public isStarted!: boolean;
    public isCompleted!: boolean;
    public currentSection?: string;
    public progressPercentage!: number;
    public timeSpent!: number;
    public startedAt?: Date;
    public completedAt?: Date;
    public lastAccessedAt?: Date;
}

UserLessonProgress.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    lessonId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id',
        },
    },
    isStarted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    currentSection: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    progressPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserLessonProgress',
    tableName: 'user_lesson_progress',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'lessonId'],
        },
    ],
});

// ==================== USER QUIZ ATTEMPTS ====================

interface UserQuizAttemptAttributes {
    id: string;
    userId: string;
    lessonId: string;
    attemptNumber: number;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    timeSpent: number; // in minutes
    isPassed: boolean;
    answers: any; // JSON structure of question IDs and user answers
    startedAt: Date;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

class UserQuizAttempts extends Model<UserQuizAttemptAttributes> implements UserQuizAttemptAttributes {
    public id!: string;
    public userId!: string;
    public lessonId!: string;
    public attemptNumber!: number;
    public totalQuestions!: number;
    public correctAnswers!: number;
    public score!: number;
    public timeSpent!: number;
    public isPassed!: boolean;
    public answers!: any;
    public startedAt!: Date;
    public completedAt?: Date;
}

UserQuizAttempts.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    lessonId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id',
        },
    },
    attemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    correctAnswers: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    answers: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserQuizAttempts',
    tableName: 'user_quiz_attempts',
    timestamps: true,
});

// ==================== WORDS MODEL (for Word of the Day) ====================

interface WordAttributes {
    id: string;
    languageId: string;
    word: string;
    translation: string;
    pronunciation?: string;
    partOfSpeech?: string;
    definition: string;
    exampleSentence?: string;
    exampleTranslation?: string;
    audioFile?: string;
    difficulty: ProficiencyLevel;
    tags?: string[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class Words extends Model<WordAttributes> implements WordAttributes {
    public id!: string;
    public languageId!: string;
    public word!: string;
    public translation!: string;
    public pronunciation?: string;
    public partOfSpeech?: string;
    public definition!: string;
    public exampleSentence?: string;
    public exampleTranslation?: string;
    public audioFile?: string;
    public difficulty!: ProficiencyLevel;
    public tags?: string[];
    public isActive!: boolean;
}

Words.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
    word: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    translation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pronunciation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    partOfSpeech: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    definition: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    exampleSentence: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    exampleTranslation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    audioFile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    difficulty: {
        type: DataTypes.ENUM(...Object.values(ProficiencyLevel)),
        allowNull: false,
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'Words',
    tableName: 'words',
    timestamps: true,
});

// ==================== DAILY WORDS (Word of the Day) ====================

interface DailyWordAttributes {
    id: string;
    languageId: string;
    wordId: string;
    date: Date;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class DailyWords extends Model<DailyWordAttributes> implements DailyWordAttributes {
    public id!: string;
    public languageId!: string;
    public wordId!: string;
    public date!: Date;
    public isActive!: boolean;
}

DailyWords.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
    wordId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'words',
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'DailyWords',
    tableName: 'daily_words',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['languageId', 'date'],
        },
    ],
});

// ==================== BADGES MODEL ====================

interface BadgeAttributes {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: BadgeType;
    criteria: any; // JSON structure defining requirements to earn the badge
    points?: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class Badges extends Model<BadgeAttributes> implements BadgeAttributes {
    public id!: string;
    public name!: string;
    public description!: string;
    public icon!: string;
    public type!: BadgeType;
    public criteria!: any;
    public points?: number;
    public isActive!: boolean;
}

Badges.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(BadgeType)),
        allowNull: false,
    },
    criteria: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'Badges',
    tableName: 'badges',
    timestamps: true,
});

// ==================== USER BADGES ====================

interface UserBadgeAttributes {
    id: string;
    userId: string;
    badgeId: string;
    earnedAt: Date;
    languageId?: string; // if badge is language-specific
    createdAt?: Date;
    updatedAt?: Date;
}

class UserBadges extends Model<UserBadgeAttributes> implements UserBadgeAttributes {
    public id!: string;
    public userId!: string;
    public badgeId!: string;
    public earnedAt!: Date;
    public languageId?: string;
}

UserBadges.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    badgeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'badges',
            key: 'id',
        },
    },
    earnedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserBadges',
    tableName: 'user_badges',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'badgeId', 'languageId'],
        },
    ],
});

// ==================== USER GOALS ====================

interface UserGoalAttributes {
    id: string;
    userId: string;
    languageId?: string;
    title: string;
    description?: string;
    targetValue: number;
    currentValue: number;
    frequency: GoalFrequency;
    isCompleted: boolean;
    startDate: Date;
    endDate: Date;
    completedAt?: Date;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class UserGoals extends Model<UserGoalAttributes> implements UserGoalAttributes {
    public id!: string;
    public userId!: string;
    public languageId?: string;
    public title!: string;
    public description?: string;
    public targetValue!: number;
    public currentValue!: number;
    public frequency!: GoalFrequency;
    public isCompleted!: boolean;
    public startDate!: Date;
    public endDate!: Date;
    public completedAt?: Date;
    public isActive!: boolean;
}

UserGoals.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    targetValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    currentValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    frequency: {
        type: DataTypes.ENUM(...Object.values(GoalFrequency)),
        allowNull: false,
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserGoals',
    tableName: 'user_goals',
    timestamps: true,
});

// ==================== USER COURSE COMPLETIONS ====================

interface UserCourseCompletionAttributes {
    id: string;
    userId: string;
    courseId: string;
    isCompleted: boolean;
    completionPercentage: number;
    totalTimeSpent: number; // in minutes
    startedAt: Date;
    completedAt?: Date;
    finalScore?: number;
    certificateUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class UserCourseCompletions extends Model<UserCourseCompletionAttributes> implements UserCourseCompletionAttributes {
    public id!: string;
    public userId!: string;
    public courseId!: string;
    public isCompleted!: boolean;
    public completionPercentage!: number;
    public totalTimeSpent!: number;
    public startedAt!: Date;
    public completedAt?: Date;
    public finalScore?: number;
    public certificateUrl?: string;
}

UserCourseCompletions.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id',
        },
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    completionPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalTimeSpent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    finalScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserCourseCompletions',
    tableName: 'user_course_completions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'courseId'],
        },
    ],
});

// ==================== USER ACTIVITIES ====================

interface UserActivityAttributes {
    id: string;
    userId: string;
    activityType: ActivityType;
    languageId?: string;
    relatedEntityId?: string; // lesson ID, quiz ID, etc.
    relatedEntityType?: string; // 'lesson', 'quiz', 'course', etc.
    metadata?: any; // JSON data for activity-specific information
    points?: number;
    timestamp: Date;
    createdAt?: Date;
}

class UserActivities extends Model<UserActivityAttributes> implements UserActivityAttributes {
    public id!: string;
    public userId!: string;
    public activityType!: ActivityType;
    public languageId?: string;
    public relatedEntityId?: string;
    public relatedEntityType?: string;
    public metadata?: any;
    public points?: number;
    public timestamp!: Date;
}

UserActivities.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    activityType: {
        type: DataTypes.ENUM(...Object.values(ActivityType)),
        allowNull: false,
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
    relatedEntityId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    relatedEntityType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserActivities',
    tableName: 'user_activities',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['timestamp'] },
        { fields: ['activityType'] },
        { fields: ['languageId'] },
    ],
});

// ==================== USER WORD OF DAY INTERACTIONS ====================

interface UserWordInteractionAttributes {
    id: string;
    userId: string;
    wordId: string;
    dailyWordId: string;
    hasViewed: boolean;
    hasPlayedAudio: boolean;
    viewedAt?: Date;
    audioPlayedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

class UserWordInteractions extends Model<UserWordInteractionAttributes> implements UserWordInteractionAttributes {
    public id!: string;
    public userId!: string;
    public wordId!: string;
    public dailyWordId!: string;
    public hasViewed!: boolean;
    public hasPlayedAudio!: boolean;
    public viewedAt?: Date;
    public audioPlayedAt?: Date;
}

UserWordInteractions.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    wordId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'words',
            key: 'id',
        },
    },
    dailyWordId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'daily_words',
            key: 'id',
        },
    },
    hasViewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    hasPlayedAudio: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    viewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    audioPlayedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: users_service_db,
    modelName: 'UserWordInteractions',
    tableName: 'user_word_interactions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'dailyWordId'],
        },
    ],
});

// ==================== MODEL ASSOCIATIONS ====================

// Language associations
Languages.hasMany(UserLanguageSubscriptions, { foreignKey: 'languageId', as: 'subscriptions' });
Languages.hasMany(Courses, { foreignKey: 'languageId', as: 'courses' });
Languages.hasMany(Words, { foreignKey: 'languageId', as: 'words' });
Languages.hasMany(DailyWords, { foreignKey: 'languageId', as: 'dailyWords' });
Languages.hasMany(UserActivities, { foreignKey: 'languageId', as: 'activities' });
Languages.hasMany(UserGoals, { foreignKey: 'languageId', as: 'goals' });

// User associations
// Note: Users model would need to be imported and associated here
// Users.hasMany(UserLanguageSubscriptions, { foreignKey: 'userId', as: 'languageSubscriptions' });
// Users.hasMany(UserLessonProgress, { foreignKey: 'userId', as: 'lessonProgress' });
// Users.hasMany(UserQuizAttempts, { foreignKey: 'userId', as: 'quizAttempts' });
// Users.hasMany(UserBadges, { foreignKey: 'userId', as: 'badges' });
// Users.hasMany(UserGoals, { foreignKey: 'userId', as: 'goals' });
// Users.hasMany(UserCourseCompletions, { foreignKey: 'userId', as: 'courseCompletions' });
// Users.hasMany(UserActivities, { foreignKey: 'userId', as: 'activities' });
// Users.hasMany(UserWordInteractions, { foreignKey: 'userId', as: 'wordInteractions' });

// UserLanguageSubscription associations
UserLanguageSubscriptions.belongsTo(Languages, { foreignKey: 'languageId', as: 'language' });

// Course associations
Courses.belongsTo(Languages, { foreignKey: 'languageId', as: 'language' });
Courses.hasMany(Lessons, { foreignKey: 'courseId', as: 'lessons' });
Courses.hasMany(UserCourseCompletions, { foreignKey: 'courseId', as: 'completions' });

// Lesson associations
Lessons.belongsTo(Courses, { foreignKey: 'courseId', as: 'course' });
Lessons.hasMany(QuizQuestions, { foreignKey: 'lessonId', as: 'questions' });
Lessons.hasMany(UserLessonProgress, { foreignKey: 'lessonId', as: 'progress' });
Lessons.hasMany(UserQuizAttempts, { foreignKey: 'lessonId', as: 'quizAttempts' });

// Quiz Question associations
QuizQuestions.belongsTo(Lessons, { foreignKey: 'lessonId', as: 'lesson' });

// User Progress associations
UserLessonProgress.belongsTo(Lessons, { foreignKey: 'lessonId', as: 'lesson' });

// User Quiz Attempts associations
UserQuizAttempts.belongsTo(Lessons, { foreignKey: 'lessonId', as: 'lesson' });

// Word associations
Words.belongsTo(Languages, { foreignKey: 'languageId', as: 'language' });
Words.hasMany(DailyWords, { foreignKey: 'wordId', as: 'dailyWords' });
Words.hasMany(UserWordInteractions, { foreignKey: 'wordId', as: 'interactions' });

// Daily Word associations
DailyWords.belongsTo(Languages, { foreignKey: 'languageId', as: 'language' });
DailyWords.belongsTo(Words, { foreignKey: 'wordId', as: 'word' });
DailyWords.hasMany(UserWordInteractions, { foreignKey: 'dailyWordId', as: 'interactions' });

// Badge associations
Badges.hasMany(UserBadges, { foreignKey: 'badgeId', as: 'userBadges' });

// User Badge associations
UserBadges.belongsTo(Badges, { foreignKey: 'badgeId', as: 'badge' });
UserBadges.belongsTo(Languages, { foreignKey: 'languageId', as: 'language' });

// User Goal associations
UserGoals.belongsTo(Languages, { foreignKey: 'languageId', as: 'language' });

// User Course Completion associations
UserCourseCompletions.belongsTo(Courses, { foreignKey: 'courseId', as: 'course' });

// User Activity associations
UserActivities.belongsTo(Languages, { foreignKey: 'languageId', as: 'language' });

// User Word Interaction associations
UserWordInteractions.belongsTo(Words, { foreignKey: 'wordId', as: 'word' });
UserWordInteractions.belongsTo(DailyWords, { foreignKey: 'dailyWordId', as: 'dailyWord' });

// ==================== EXPORTS ====================

export {
    Languages,
    UserLanguageSubscriptions,
    Courses,
    Lessons,
    QuizQuestions,
    UserLessonProgress,
    UserQuizAttempts,
    Words,
    DailyWords,
    Badges,
    UserBadges,
    UserGoals,
    UserCourseCompletions,
    UserActivities,
    UserWordInteractions,
    // Others
    LanguageCode,
    ProficiencyLevel,
    LessonType,
    QuestionType,
    ActivityType,
    BadgeType,
    GoalFrequency,
};