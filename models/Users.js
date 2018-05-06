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
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      unique: false,
      set: function (value) {
        const that = this;
        bcrypt.genSalt(10, (err, salt) => {
          if (err) { return console.log('BCRYPT GEN SALT ERR:', err); }

          bcrypt.hash(value, salt, null, (error, hash) => {
            if (error) { return console.log('BCRYPT HASH ERR:', err); }

            console.log('--> SEQ: BCRYPT hash SET', hash);
            that.setDataValue('password', value);
            that.setDataValue('password_hash', hash);
          });
        });
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
  });

  Users.prototype.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password_hash, (err, isMatch) => {
      cb(err, isMatch);
    });
  };
  return Users;
};

