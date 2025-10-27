"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const waitingListRoutes_1 = __importDefault(require("./routes/waitingListRoutes"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const utilities_1 = require("../../shared/utilities");
const config_1 = __importDefault(require("../../config/config"));
const app = (0, express_1.default)();
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
app.use('/', waitingListRoutes_1.default);
// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'founders-list-service',
        status: 'ok',
    });
});
// Error handling
app.use(utilities_1.errorUtilities.globalErrorHandler);
// Start server if not imported as a module
if (require.main === module) {
    const PORT = config_1.default.FOUNDERS_LIST_SERVICE_SERVER_PORT;
    app.listen(PORT, () => {
        console.log(`Founders List Server running on port ${PORT}`);
    });
}
exports.default = app;
