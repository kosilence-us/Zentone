const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.VIRTUAL
    },
    phone: {
      type: DataTypes.STRING
    },
    age: {
      type: DataTypes.INTEGER
    },
    gender: {
      type: DataTypes.STRING
    },
    location: {
      type: DataTypes.STRING
    },
  });

  Users.beforeCreate((user, options) => {
    console.log('--> setting value ');
    // const that = this;
    // user.setDataValue('password', user.password);
    return bcrypt.genSalt(10, (err, salt) => {
      if (err) return err;
      bcrypt.hash(user.password, salt, null, (error, hash) => {
        if (error) return err;
        user.password = hash;
      });
    });
  });
  Users.prototype.comparePassword = function (candidatePassword, done) {
    bcrypt.compare(candidatePassword, this.password_hash, (err, isMatch) => {
      done(err, isMatch);
    });
  };

  return Users;
};

