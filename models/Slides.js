module.exports = (sequelize, DataTypes) => sequelize
  .define('Slides', {
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
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    uploadDate: {
      type: DataTypes.STRING
    },
    size: {
      type: DataTypes.STRING
    }
  });