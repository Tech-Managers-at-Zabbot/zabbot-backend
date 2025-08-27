"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalConfig = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const http_1 = require("http");
const utilities_1 = require("./utilities");
// import './models/associations';
const config_1 = __importDefault(require("../../config/config"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
exports.externalConfig = {
    PORT: config_1.default.EDEDUN_PORT || 3006,
    // dbUrl: process.env.DB_URL,
    // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};
// Set security HTTP headers to disable 'powered by Express' header feature
app.disable("x-powered-by");
// Set security HTTP headers
app.use((0, helmet_1.default)());
// Parse urlencoded request body
app.use(express_1.default.urlencoded({ extended: true }));
// Compress response to increase speed
app.use((0, compression_1.default)());
// Set Cors
app.use((0, cors_1.default)());
//Other Middlewares
app.use(body_parser_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/", routes_1.default);
// Health Check Endpoint
app.get("/", (request, response) => {
    response.send("Welcome to Èdèdún APYP's Backend Server. 👋");
});
// Error handler
app.use(utilities_1.errorUtilities.globalErrorHandler);
/**
 * Server
 */
server.listen(exports.externalConfig.PORT, () => {
    console.log(`Èdèdún server running on Port ${exports.externalConfig.PORT}`);
});
exports.default = app;
