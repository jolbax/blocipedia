'use strict';
module.exports = (sequelize, DataTypes) => {
  const Collaborator = sequelize.define(
    'Collaborator',
    {
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      wikiId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {}
  );
  Collaborator.associate = function(models) {
    Collaborator.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
    Collaborator.belongsTo(models.Wiki, {
      foreignKey: 'wikiId',
      onDelete: 'CASCADE',
    });
  };
  return Collaborator;
};
