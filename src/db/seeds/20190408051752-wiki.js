"use strict";

const faker = require("faker");

let wikis = [];

// 20 public wikis for usersId 101 to 115
for (let i = 0; i < 20; i++) {
  wikis.push({
    id: i + 200,
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    private: false,
    userId: Math.floor(Math.random() * 15) + 100,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// 10 private wikis for usersId 111 to 115
for (let i = 0; i < 10; i++) {
  wikis.push({
    id: i + 220,
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    private: true,
    userId: Math.floor(Math.random() * 5) + 110,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Wikis", wikis, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Wikis", wikis, {});
  }
};
