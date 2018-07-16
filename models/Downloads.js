module.exports = (sequelize, DataTypes) => {
  const Downloads = sequelize.define('Downloads', {
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
    userDownloadedID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    presentationID: {
      type: DataTypes.STRING
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
  return Downloads;
};