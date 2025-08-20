import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../../config/databases';
import Users from '../users/users.entities';
import { OtpAttributes, OtpNotificationType } from '../../../databaseTypes/user-service-types';



class Otp extends Model<OtpAttributes> implements OtpAttributes {
    public id!: string;
    public userId!: string;
    public otp!: string;
    public expiresAt!: Date;
    public isUsed!: boolean;
    public notificationType!: OtpNotificationType;
    public isVerified?: boolean;
    public attempts?: number;
    public verifiedAt?: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Otp.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Users,
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        otp: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
                isAfter: new Date().toISOString(),
            },
        },
        isUsed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        notificationType: {
            type: DataTypes.ENUM(...Object.values(OtpNotificationType)),
            allowNull: false,
        },
        attempts: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 10,
            },
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: users_service_db,
        modelName: 'Otp',
        tableName: 'otps',
        timestamps: true,
        paranoid: false,
        indexes: [
            {
                fields: ['userId', 'notificationType'],
            },
            {
                fields: ['expiresAt'],
            },
            {
                fields: ['createdAt'],
            },
        ],
        hooks: {
            beforeCreate: (otp: Otp) => {
                if (!otp.expiresAt) {
                    otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                }
            },
        },
    }
);

export default Otp;