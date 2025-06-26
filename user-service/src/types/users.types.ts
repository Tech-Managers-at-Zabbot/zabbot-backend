export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export enum RegisterMethods {
  GOOGLE = 'google',
  EMAIL = 'email'
}

export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  registerMethod: RegisterMethods;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  accessToken?: string;
  refreshToken?: string;
  isFirstTimeLogin: boolean;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  verifiedAt: Date;
  country?: string;
  phoneNumber?: string;
  deletedAt?: Date;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    privacy?: {
      profileVisibility?: string;
    };
  };
  lastLoginAt?: Date;
  lastPasswordChangeAt?: Date;
  twoFactorEnabled?: boolean;
  securityQuestions?: {
    question: string;
    answer: string;
  }[];
}



export enum OtpNotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  TWO_FACTOR = 'two-factor'
}

export interface OtpAttributes {
  id: string;
  userId: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  notificationType: OtpNotificationType;
  isVerified?: boolean;
  attempts?: number;
  verifiedAt?: Date;
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  PURCHASE = 'PURCHASE',
  API_ACCESS = 'API_ACCESS',
  SECURITY_EVENT = 'SECURITY_EVENT'
}

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface UserActivityLogAttributes {
  id: number;
  userId: number;
  activityType: ActivityType;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: object;
  level: LogLevel;
  timestamp: Date;
  sessionId?: string;
  resourceId?: string;
  success: boolean;
}


export enum SecurityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}
export interface SecurityLogAttributes {
  id: number;
  userId?: number;
  eventType: string;
  severity: SecurityLevel;
  ipAddress: string;
  userAgent?: string;
  details: object;
  timestamp: Date;
  resolved: boolean;
}

export type GoogleStrategyOptions = {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
};
