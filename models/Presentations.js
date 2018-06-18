module.exports = (sequelize, DataTypes) => sequelize
  .define('Presentations', {
    id: {
      type: DataTypes.STRING,
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
