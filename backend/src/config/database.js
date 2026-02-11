const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function connect() {
  return open({
    filename: path.join(__dirname, '../database/efetivo360.db'),
    driver: sqlite3.Database
  });
}

module.exports = connect;
