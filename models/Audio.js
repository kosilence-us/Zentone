module.exports = (sequelize, DataTypes) => sequelize
  .define('Audio', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    presentationID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    originalFileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uploadDate: {
      type: DataTypes.STRING
    },
    size: {
      type: DataTypes.INTEGER
    }
  });
