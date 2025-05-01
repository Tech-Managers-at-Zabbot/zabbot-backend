import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface WaitingListAttributes {
  id?: number;
  name: string;
  email: string;
  country: string;
  sendUpdates: boolean;
  betaTest: boolean;
  contributeSkills: boolean;
  createdAt?: Date;
}

class WaitingList extends Model<WaitingListAttributes> implements WaitingListAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public country!: string;
  public sendUpdates!: boolean;
  public betaTest!: boolean;
  public contributeSkills!: boolean;
  public readonly createdAt!: Date;
}

WaitingList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
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
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sendUpdates: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    betaTest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    contributeSkills: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'WaitingList',
    tableName: 'waiting_lists',
    timestamps: false,
  }
);

export default WaitingList;