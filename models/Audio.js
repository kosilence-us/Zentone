module.exports = (sequelize, DataTypes) => sequelize
  .define('Audio', {
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
      unique: false
    },
  });