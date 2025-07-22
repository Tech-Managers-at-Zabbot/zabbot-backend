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
    res.send(`
    <html>
    <head>
      <title>Users Service Health Check</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 5%; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 10px 0; }
        .route-holder {
        display: flex;
        flex-direction: column;
        margin-Bottom: 20px;
        }

        .route-title{
        font-weight: bold;
        margin-Bottom: 5px;
        }
      </style>
    </head>
    <body>
<h1>Service: Users Service Server</h1>
<h2>Status: OK</h2>
<h3>Local Port: ${exports.config.port}</h3>
<div>
  <h4>Available Routes:</h4>
  <ul>

    <li class="route-holder">
      <div class="route-title">Email Signup:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/signup</a></div>
      <div>Local Route: <a href="#">localhost:3004/signup</a></div>
    </li>

    <li class="route-holder">
      <div class="route-title">Email Login:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/login</a></div>
      <div>Local Route: <a href="#">localhost:3004/login</a></div>
    </li>

     <li class="route-holder">
      <div class="route-title">Verify User OTP:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/verify-user</a></div>
      <div>Local Route: <a href="#">localhost:3004/verify-user</a></div>
    </li>

     <li class="route-holder">
      <div class="route-title">Resend Verification OTP:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/resend-verification-otp</a></div>
      <div>Local Route: <a href="#">localhost:3004/resend-verification-otp</a></div>
    </li>

    <li class="route-holder">
      <div class="route-title">Reset Password Link Request:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/reset-password-request</a></div>
      <div>Local Route: <a href="#">localhost:3004/reset-password-request</a></div>
    </li>

    <li class="route-holder">
      <div class="route-title">Change Password:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/reset-password</a></div>
      <div>Local Route: <a href="#">localhost:3004/reset-password</a></div>
    </li>

     <li class="route-holder">
      <div class="route-title">Google Auth Register:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/google/register</a></div>
      <div>Local Route: <a href="#">localhost:3004/google/register</a></div>
    </li>

    <li class="route-holder">
      <div class="route-title">Google Auth Login:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/google/login</a></div>
      <div>Local Route: <a href="#">localhost:3004/google/login</a></div>
    </li>

    <li class="route-holder">
      <div class="route-title">Google Auth Register Callback:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/google/register/callback</a></div>
      <div>Local Route: <a href="#">localhost:3004/google/register/callback</a></div>
    </li>

     <li class="route-holder">
      <div class="route-title">Google Auth Login Callback:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/google/login/callback</a></div>
      <div>Local Route: <a href="#">localhost:3004/google/login/callback</a></div>
    </li>

    <li class="route-holder">
      <div class="route-title">Google Auth Failure:</div>
      <div>Main Server Route: <a href="#">localhost:3010/api/v1/users/google/failure</a></div>
      <div>Local Route: <a href="#">localhost:3004/google/failure</a></div>
    </li>

  </ul>
</div>
</body>
</html>
  `);
});
// associateUserModels();
// Error handling
app.use(utilities_1.errorUtilities.globalErrorHandler);
utilities_2.googleAuthUtilities.setupGoogleRegisterStrategy(services_1.googleAuthServices.googleOAuthRegister);
utilities_2.googleAuthUtilities.setupGoogleLoginStrategy(services_1.googleAuthServices.googleOAuthLogin);
// Keep the existing serialize/deserialize functions as they are
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
