import { DataTypes, Model, Optional } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import Users from './users.entities';
import { UserActivityLogAttributes, ActivityType, LogLevel } from '../types/users.types';


interface UserActivityLogCreationAttributes 
  extends Optional<UserActivityLogAttributes, 'id' | 'timestamp'> {}

export class UserActivityLog extends Model<
  UserActivityLogAttributes,
  UserActivityLogCreationAttributes
> implements UserActivityLogAttributes {
  public id!: number;
  public userId!: number;
  public activityType!: ActivityType;
  public description!: string;
  public ipAddress?: string;
  public userAgent?: string;
  public metadata?: object;
  public level!: LogLevel;
  public timestamp!: Date;
  public sessionId?: string;
  public resourceId?: string;
  public success!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
        key: 'id',
      },
    },
    activityType: {
      type: DataTypes.ENUM(...Object.values(ActivityType)),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    level: {
      type: DataTypes.ENUM(...Object.values(LogLevel)),
      allowNull: false,
      defaultValue: LogLevel.INFO,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize:users_service_db,
    modelName: 'UserActivityLogs',
    tableName: 'user_activity_logs',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['activityType'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['userId', 'activityType'],
      },
      {
        fields: ['level'],
      },
    ],
  }
);