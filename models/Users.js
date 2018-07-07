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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING
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
    website: {
      type: DataTypes.STRING
    },
    company: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    gravatar: {
      type: DataTypes.STRING
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  Users.beforeCreate((user, options) => new Promise((resolve, reject) => {
      const { password } = user;
      bcrypt.genSalt(10, (err, salt) => {
        if (err) reject(err);
        bcrypt.hash(password, salt, null, (error, hash) => {
          if (error) reject(err);
          user.password = hash;
          resolve(user);
        });
      });
    }));
    // TODO: add hook
  // Users.beforeUpdate((user, options) => new Promise((resolve, reject) => {
  //   const { password } = user;
  //   bcrypt.genSalt(10, (err, salt) => {
  //     if (err) reject(err);
  //     bcrypt.hash(password, salt, null, (error, hash) => {
  //       if (error) reject(err);
  //       user.password = hash;
  //       resolve(user);
  //     });
  //   });
  // }));
  Users.prototype.comparePassword = function (candidatePassword, done) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      done(err, isMatch);
    });
  };

  return Users;
};

