import Joi from "joi";
declare const _default: {
    userRegisterSchemaViaEmail: Joi.ObjectSchema<any>;
    loginUserSchema: Joi.ObjectSchema<any>;
    inputValidator: (schema: Joi.Schema) => any;
    resendVerificationLinkSchema: Joi.ObjectSchema<any>;
    resetPasswordSchema: Joi.ObjectSchema<any>;
};
export default _default;
