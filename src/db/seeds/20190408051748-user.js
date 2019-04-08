"use strict";

const faker = require("faker");
const bcrypt = require("bcryptjs");

let users = [];
const salt = bcrypt.genSaltSync();

// Create 10 standard accounts
for (let i = 0; i < 10; i++) {
  let username = faker.internet.userName().toLocaleLowerCase();
  let hashedPassword = bcrypt.hashSync("123123", salt);
  users.push({
    id: i + 100,
    username: username,
    email: `${username}@space.com`,
    password: hashedPassword,
    role: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// Create 5 premium accounts
for (let i = 0; i < 5; i++) {
  let username = faker.internet.userName().toLocaleLowerCase();
  let hashedPassword = bcrypt.hashSync("123123", salt);
  users.push({
    id: i + 110,
    username: username,
    email: `${username}@space.com`,
    password: hashedPassword,
    role: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    let ids = Array.from({ length: 15 }, (v, k) => k + 100);
    return queryInterface.bulkDelete("Users", { id: ids }, {});
  }
};
