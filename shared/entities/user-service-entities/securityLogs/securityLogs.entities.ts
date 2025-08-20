import { DataTypes, Model, Optional } from 'sequelize';
import { users_service_db } from '../../../../config/databases';
import Users from '../users/users.entities';
import { SecurityLevel, SecurityLogAttributes } from '../../../databaseTypes/user-service-types';



interface SecurityLogCreationAttributes 
  extends Optional<SecurityLogAttributes, 'id' | 'timestamp' | 'resolved'> {}

export class SecurityLog extends Model<
  SecurityLogAttributes,
  SecurityLogCreationAttributes
> implements SecurityLogAttributes {
  public id!: number;
  public userId?: number;
  public eventType!: string;
  public severity!: SecurityLevel;
  public ipAddress!: string;
  public userAgent?: string;
  public details!: object;
  public timestamp!: Date;
  public resolved!: boolean;
}

SecurityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: 'id',
      },
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: users_service_db,
    modelName: 'SecurityLog',
    tableName: 'security_logs',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['eventType'],
      },
      {
        fields: ['severity'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['resolved'],
      },
    ],
  }
);