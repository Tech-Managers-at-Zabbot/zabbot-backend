"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const lesson_service_types_1 = require("../../../shared/databaseTypes/lesson-service-types");
const inputValidator = (schema) => {
    return async (request, response, next) => {
        try {
            const { error } = schema.validate(request.body);
            if (error) {
                return response.status(400).json({
                    status: "error",
                    message: `${error.details[0].message.replace(/["\\]/g, "")}`,
                });
            }
            return next();
        }
        catch (err) {
            return response.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    };
};
const baseQuizSchema = {
    courseId: joi_1.default.string().uuid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'Course ID must be a valid UUID',
        'any.required': 'Course ID is required'
    }),
    languageId: joi_1.default.string().uuid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'Language ID must be a valid UUID',
        'any.required': 'Language ID is required'
    }),
    instruction: joi_1.default.string().min(1).max(500).required().messages({
        'string.empty': 'Instruction is required',
        'string.min': 'Instruction is required',
        'string.max': 'Instruction must be less than 500 characters',
        'any.required': 'Instruction is required'
    }),
    question: joi_1.default.string().min(1).max(1000).required().messages({
        'string.empty': 'Question is required',
        'string.min': 'Question is required',
        'string.max': 'Question must be less than 1000 characters',
        'any.required': 'Question is required'
    }),
    lessonId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional().allow(null).messages({
        'string.guid': 'Lesson ID must be a valid UUID'
    }),
    contentId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional().allow(null).messages({
        'string.guid': 'Content ID must be a valid UUID'
    }),
};
const multipleChoiceSchema = joi_1.default.object({
    ...baseQuizSchema,
    quizType: joi_1.default.string().valid(lesson_service_types_1.QuizType.MULTIPLE_CHOICE).required(),
    options: joi_1.default.array()
        .items(joi_1.default.string().min(1).messages({
        'string.empty': 'Option cannot be empty',
        'string.min': 'Option cannot be empty'
    }))
        .min(2)
        .max(6)
        .required()
        .messages({
        'array.min': 'Multiple choice must have at least 2 options',
        'array.max': 'Multiple choice can have at most 6 options',
        'any.required': 'Options are required for multiple choice'
    }),
    correctOption: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Correct option is required',
        'string.min': 'Correct option is required',
        'any.required': 'Correct option is required'
    }),
    correctAnswer: joi_1.default.forbidden()
}).custom((value, helpers) => {
    if (value.options && value.correctOption && !value.options.includes(value.correctOption)) {
        return helpers.error('correctOption.invalid');
    }
    return value;
}).messages({
    'correctOption.invalid': 'Correct option must be one of the provided options'
});
const fillInBlankSchema = joi_1.default.object({
    ...baseQuizSchema,
    quizType: joi_1.default.string().valid(lesson_service_types_1.QuizType.FILL_IN_BLANK).required(),
    correctAnswer: joi_1.default.string().min(1).max(200).required().messages({
        'string.empty': 'Correct answer is required',
        'string.min': 'Correct answer is required',
        'string.max': 'Correct answer must be less than 200 characters',
        'any.required': 'Correct answer is required'
    }),
    options: joi_1.default.array()
        .items(joi_1.default.string().min(1).messages({
        'string.empty': 'Option cannot be empty',
        'string.min': 'Option cannot be empty'
    }))
        .min(2)
        .max(6)
        .optional()
        .messages({
        'array.min': 'If provided, options must have at least 2 items',
        'array.max': 'Options can have at most 6 items'
    }),
    correctOption: joi_1.default.forbidden()
}).custom((value, helpers) => {
    if (value.options && value.correctAnswer) {
        const normalizedCorrectAnswer = value.correctAnswer.toLowerCase().trim();
        const normalizedOptions = value.options.map((option) => option.toLowerCase().trim());
        if (!normalizedOptions.includes(normalizedCorrectAnswer)) {
            return helpers.error('correctAnswer.notInOptions');
        }
    }
    return value;
}).messages({
    'correctAnswer.notInOptions': 'If options are provided, the correct answer must be one of them'
});
const createQuizSchema = joi_1.default.alternatives()
    .try(multipleChoiceSchema, fillInBlankSchema)
    .custom((value, helpers) => {
    const hasLesson = !!value.lessonId;
    const hasContent = !!value.contentId;
    if (!hasLesson && !hasContent) {
        return helpers.error('lessonOrContent.required');
    }
    if (hasLesson && hasContent) {
        return helpers.error('lessonOrContent.exclusive');
    }
    return value;
})
    .messages({
    'lessonOrContent.required': 'Quiz must be associated with either a lesson or content',
    'lessonOrContent.exclusive': 'Quiz cannot be associated with both lesson and content'
});
const updateQuizSchema = joi_1.default.object({
    courseId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional(),
    languageId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional(),
    instruction: joi_1.default.string().min(1).max(500).optional(),
    question: joi_1.default.string().min(1).max(1000).optional(),
    lessonId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional().allow(null),
    contentId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional().allow(null),
    quizType: joi_1.default.string().valid(...Object.values(lesson_service_types_1.QuizType)).optional(),
    options: joi_1.default.array().items(joi_1.default.string().min(1)).min(2).max(6).optional(),
    correctOption: joi_1.default.string().min(1).optional(),
    correctAnswer: joi_1.default.string().min(1).max(200).optional(),
}).custom((value, helpers) => {
    if (value.quizType === lesson_service_types_1.QuizType.MULTIPLE_CHOICE) {
        if (value.options && value.correctOption && !value.options.includes(value.correctOption)) {
            return helpers.error('update.invalidMultipleChoice');
        }
    }
    if (value.quizType === lesson_service_types_1.QuizType.FILL_IN_BLANK) {
        if (value.options && value.correctAnswer) {
            const normalizedCorrectAnswer = value.correctAnswer.toLowerCase().trim();
            const normalizedOptions = value.options.map((option) => option.toLowerCase().trim());
            if (!normalizedOptions.includes(normalizedCorrectAnswer)) {
                return helpers.error('update.invalidFillInBlank');
            }
        }
    }
    if (value.hasOwnProperty('lessonId') || value.hasOwnProperty('contentId')) {
        const hasLesson = !!value.lessonId;
        const hasContent = !!value.contentId;
        if (hasLesson && hasContent) {
            return helpers.error('update.lessonContentExclusive');
        }
    }
    return value;
}).messages({
    'update.invalidMultipleChoice': 'For multiple choice, correct option must be one of the provided options',
    'update.invalidFillInBlank': 'For fill in blank, if options are provided, correct answer must be one of them',
    'update.lessonContentExclusive': 'Quiz cannot be associated with both lesson and content'
});
const submitQuizAnswerSchema = joi_1.default.object({
    quizId: joi_1.default.string().uuid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'Quiz ID must be a valid UUID',
        'any.required': 'Quiz ID is required'
    }),
    userId: joi_1.default.string().uuid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'User ID must be a valid UUID',
        'any.required': 'User ID is required'
    }),
    userAnswer: joi_1.default.string().min(1).max(500).required().messages({
        'string.empty': 'Answer cannot be empty',
        'string.min': 'Answer cannot be empty',
        'string.max': 'Answer must be less than 500 characters',
        'any.required': 'Answer is required'
    }),
});
const getQuizzesQuerySchema = joi_1.default.object({
    courseId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional(),
    lessonId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional(),
    contentId: joi_1.default.string().uuid({ version: 'uuidv4' }).optional(),
    quizType: joi_1.default.string().valid(...Object.values(lesson_service_types_1.QuizType)).optional(),
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
});
const addUserCourseSchema = joi_1.default.object({});
exports.default = {
    inputValidator,
    createQuizSchema,
    updateQuizSchema,
    submitQuizAnswerSchema,
    getQuizzesQuerySchema,
};
