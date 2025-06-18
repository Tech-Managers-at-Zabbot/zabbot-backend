import Otp from "./otp.entities";
import Users from "./users.entities";

export function associateUserModels() {
  Otp.belongsTo(Users, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Users.hasMany(Otp, {
    foreignKey: 'userId',
    as: 'otps',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}