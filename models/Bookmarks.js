module.exports = (sequelize, DataTypes) => {
  const Bookmarks = sequelize.define('Bookmarks', {
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
    userBookmarkedID: {
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
  return Bookmarks;
};