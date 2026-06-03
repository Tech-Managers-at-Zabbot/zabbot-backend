import { Model } from "sequelize";
export interface NewsletterSubscriptionAttributes {
    id: string;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class NewsletterSubscription extends Model<NewsletterSubscriptionAttributes> implements NewsletterSubscriptionAttributes {
    id: string;
    email: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default NewsletterSubscription;
