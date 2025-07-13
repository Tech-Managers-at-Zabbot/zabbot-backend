import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import waitingListRoutes from './routes/waitingListRoutes';
import helmet from "helmet";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import path from 'path';
import { errorUtilities } from '../../shared/utilities';
import userRoutes from './routes'
import passport from 'passport';
import { googleAuthUtilities } from './utilities';
import Users from './entities/users.entities';
import { googleAuthServices } from './services';

// import { associateUserModels } from './entities/associations';

const app = express();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.USERS_PORT || 3004,
  // dbUrl: process.env.DB_URL,
  // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};

app.disable("x-powered-by");

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/', userRoutes);

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
<h3>Local Port: ${config.port}</h3>
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
app.use(errorUtilities.globalErrorHandler as any);

googleAuthUtilities.setupGoogleRegisterStrategy(googleAuthServices.googleOAuthRegister);
googleAuthUtilities.setupGoogleLoginStrategy(googleAuthServices.googleOAuthLogin);

// Keep the existing serialize/deserialize functions as they are
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await Users.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error as any, null);
  }
});


// Start server if not imported as a module
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Users Service running on port ${PORT}`);
  });
}

export default app;