import { DataTypes, Model } from "sequelize";
import { ededun_database } from "../../../../config/databases";
import {
  RecordingAttributes
} from "../../types/modelTypes";

export class Recordings extends Model<RecordingAttributes> {}

Recordings.init(
  {
      id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
      },

      user_id: {
          type: DataTypes.UUID,
          allowNull: true,
      },

    phrase_id: {
          type: DataTypes.UUID,
          allowNull: true,
      },
      recording_url: {
          type: DataTypes.TEXT,
          allowNull: true,
      },

      status: {
          type: DataTypes.STRING,
          allowNull: true,
      },
  },
  {
    sequelize: ededun_database,
    tableName: "Recordings",
  }
);

export default Recordings;