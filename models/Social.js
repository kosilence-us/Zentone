module.exports = (sequelize, DataTypes) => {
  const Social = sequelize.define('Social', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    followers: {
      type: DataTypes.INTEGER
    },
    following: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    bookmarked: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    }
  });
  return Social;
};
