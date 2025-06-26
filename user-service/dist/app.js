"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import waitingListRoutes from './routes/waitingListRoutes';
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const utilities_1 = require("../../shared/utilities");
const routes_1 = __importDefault(require("./routes"));
const passport_1 = __importDefault(require("passport"));
const utilities_2 = require("./utilities");
const users_entities_1 = __importDefault(require("./entities/users.entities"));
const services_1 = require("./services");
// import { associateUserModels } from './entities/associations';
const app = (0, express_1.default)();
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
    port: process.env.USERS_PORT || 3004,
    // dbUrl: process.env.DB_URL,
    // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};
app.disable("x-powered-by");
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/', routes_1.default);
// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Users Service Server',
        status: 'ok',
    });
});
// associateUserModels();
// Error handling
app.use(utilities_1.errorUtilities.globalErrorHandler);
utilities_2.googleAuthUtilities.setupGoogleStrategy(services_1.googleAuthServices.googleOAuthVerify);
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await users_entities_1.default.findByPk(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
// Start server if not imported as a module
if (require.main === module) {
    const PORT = exports.config.port;
    app.listen(PORT, () => {
        console.log(`Users Service running on port ${PORT}`);
    });
}
exports.default = app;
