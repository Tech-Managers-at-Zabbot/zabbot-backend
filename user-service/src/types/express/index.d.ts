declare global {
  namespace Express {
    interface User {
      [key: string]: any;
    }

    interface Request {
      user?: User;
      authInfo?: {
        message?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
