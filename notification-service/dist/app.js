"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const utilities_1 = require("../../shared/utilities");
const routes_1 = __importDefault(require("./routes"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
    port: process.env.NOTIFICATION_SERVICE_PORT || 3003,
    // dbUrl: process.env.DB_URL,
    // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};
app.disable("x-powered-by");
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/notification', routes_1.default);
app.get('/', (req, res) => {
    res.json({
        service: 'Notification Server',
        status: 'ok',
    });
});
// Error handling
app.use(utilities_1.errorUtilities.globalErrorHandler);
// Start server if not imported as a module
if (require.main === module) {
    const PORT = exports.config.port;
    app.listen(PORT, () => {
        console.log(`Notification Server running on port ${PORT}`);
    });
}
exports.default = app;
