import { DataTypes, Model, Sequelize } from 'sequelize';
import { DailyWordAttributes } from '../data-types/interface';
import { users_service_db } from '../../../config/databases';


class WordForTheDay extends Model<DailyWordAttributes> implements DailyWordAttributes {
    public id!: string;
    public languageId!: string;
    public dateUsed!: Date;
    public isActive!: boolean;
    public audioUrls!: string[];
    public languageText!: string;
    public englishText!: string;
    public isUsed!: boolean;
    public pronunciationNote?: string;
}

WordForTheDay.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    languageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'languages',
            key: 'id',
        },
    },
    dateUsed: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    audioUrls: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    languageText: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    englishText: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    pronunciationNote: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
},
    {
        sequelize: users_service_db,
        modelName: 'WordForTheDay',
        tableName: 'wordForTheDay',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['languageId', 'dateUsed'],
            },
        ],
    }
);





export default WordForTheDay;