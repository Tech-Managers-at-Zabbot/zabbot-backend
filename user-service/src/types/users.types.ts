export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
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