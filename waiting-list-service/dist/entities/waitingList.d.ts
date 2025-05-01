import { Model } from 'sequelize';
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
declare class WaitingList extends Model<WaitingListAttributes> implements WaitingListAttributes {
    id: number;
    name: string;
    email: string;
    country: string;
    sendUpdates: boolean;
    betaTest: boolean;
    contributeSkills: boolean;
    readonly createdAt: Date;
}
export default WaitingList;
