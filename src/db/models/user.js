"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: { msg: "must be a valid email" }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {}
  );
  User.associate = function(models) {
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "wikis"
    });
    User.hasMany(models.Collaborator, {
      foreignKey: "userId",
      as: "collaborations"
    });
  };

  User.prototype.getPublicWikis = function() {
    if (this.wikis.length === 0) return null;
    return this.wikis.filter(wiki => wiki.private === false);
  };

  User.prototype.getPrivateWikis = function() {
    if (this.wikis.length === 0) return null;
    return this.wikis.filter(wiki => wiki.private === true);
  };

  return User;
};
