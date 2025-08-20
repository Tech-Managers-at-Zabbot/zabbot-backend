import { DataTypes, Model, Sequelize } from 'sequelize';
import { founders_list_db } from '../../../config/databases';

interface WaitingListAttributes {
  id: string;
  name: string;
  email: string;
  country: string;
  sendUpdates: boolean;
  betaTest: boolean;
  contributeSkills: boolean;
  createdAt?: Date;
}

class WaitingList extends Model<WaitingListAttributes> implements WaitingListAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public country!: string;
  public sendUpdates!: boolean;
  public betaTest!: boolean;
  public contributeSkills!: boolean;
  // public readonly createdAt!: Date;
}

WaitingList.init(
  {
    id: {
      type: DataTypes.UUID,
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
  },
  {
    sequelize: founders_list_db,
    modelName: 'WaitingList',
    tableName: 'waiting_lists',
    timestamps: true,
  }
);

export default WaitingList;