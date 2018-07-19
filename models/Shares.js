module.exports = (sequelize, DataTypes) => {
  const Shares = sequelize.define('Shares', {
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
    userSharedID: {
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
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
  return Shares;
};