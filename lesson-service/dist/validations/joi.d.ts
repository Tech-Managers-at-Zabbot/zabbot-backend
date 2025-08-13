import Joi from 'joi';
declare const _default: {
    inputValidator: (schema: Joi.Schema) => any;
    createQuizSchema: Joi.AlternativesSchema<any>;
    updateQuizSchema: Joi.ObjectSchema<any>;
    submitQuizAnswerSchema: Joi.ObjectSchema<any>;
    getQuizzesQuerySchema: Joi.ObjectSchema<any>;
};
export default _default;
