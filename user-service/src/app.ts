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
  res.json({
    service: 'Users Service Server',
    status: 'ok',
  });
});

// associateUserModels();

// Error handling
app.use(errorUtilities.globalErrorHandler as any);

googleAuthUtilities.setupGoogleStrategy(googleAuthServices.googleOAuthVerify);

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