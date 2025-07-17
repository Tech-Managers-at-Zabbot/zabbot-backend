import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { LanguageAttributes, LanguageContentAtrributes } from '../data-types/interface';

class LanguageContents extends Model<LanguageContentAtrributes> implements LanguageContentAtrributes {
    public id!: string;
    public languageId!: string;
    public title!: string;
    public word!: string;
    public tone!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

LanguageContents.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        languageId: {
            type: DataTypes.UUID,
            allowNull: false    
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        word: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
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

export default LanguageContents;