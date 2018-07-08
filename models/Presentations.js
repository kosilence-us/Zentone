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
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['empty']
    },
    title: {
      type: DataTypes.STRING,
      defaultValue: 'empty'
    },
    article: {
      type: DataTypes.TEXT,
      defaultValue: 'empty'
    },
    views: {
      type: DataTypes.INTEGER
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
