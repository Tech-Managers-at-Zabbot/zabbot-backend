import { DataTypes, Model, Sequelize } from 'sequelize';
import { users_service_db } from '../../../config/databases';
import { ContentAttributes } from '../data-types/interface';

class Contents extends Model<ContentAttributes> implements ContentAttributes {
    public id?: string;
    public lessonId!: string;
    public languageContentId!: string;
    public translation?: string;
    public filePathId?: string;
    public createdAt!: Date;
    public updatedAt?: Date;
}

Contents.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        lessonId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        languageContentId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true
        },
        translation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        filePathId: {
            type: DataTypes.UUID,
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

export default Contents;