import { DataTypes, Model } from 'sequelize';
import { users_service_db } from '../../../../config/databases';
import { RegisterMethods, UserAttributes, UserRoles } from '../../../databaseTypes/user-service-types';


class Users extends Model<UserAttributes> implements UserAttributes {
    public id!: string;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public password!: string;
    public isVerified!: boolean;
    public isFirstTimeLogin!: boolean;
    public role!: string;
    public isActive!: boolean;
    public isBlocked!: boolean;
    public verifiedAt!: Date;
    public registerMethod!: RegisterMethods;
    public googleAccessToken?: string;
    public googleRefreshToken?: string;
    public accessToken?: string;
    public refreshToken?: string;
    public country?: string;
    public phoneNumber?: string;
    public deletedAt?: Date;
    public profilePicture?: string;
    public bio?: string;
    public dateOfBirth?: Date;
    public address?: string;
    public timeZone!: string;
    public socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };
    public preferences?: {
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
    public lastLoginAt?: Date;
    public lastPasswordChangeAt?: Date;
    public twoFactorEnabled?: boolean;
    public securityQuestions?: {
        question: string;
        answer: string;
    }[];
}

Users.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        isBlocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isFirstTimeLogin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        role: {
            allowNull: false,
            type: DataTypes.ENUM(...Object.values(UserRoles)),
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dateOfBirth: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        socialLinks: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        preferences: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        timeZone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastPasswordChangeAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        twoFactorEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        securityQuestions: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        registerMethod: {
            type: DataTypes.ENUM(...Object.values(RegisterMethods)),
            allowNull: false,
        },
        googleAccessToken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        googleRefreshToken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize: users_service_db,
        modelName: 'Users',
        tableName: 'users',
        timestamps: true,
        paranoid: true,
    }
);

export default Users;