
const database = require('../data/sqlite');

database.connect();
database.initDatabase();
//database.populate(db);
database.logVersion();


