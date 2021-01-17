const app = require ('./app');
const config = require('./config/config.js');

require('./jobs/refresh-database.js');
require('./loaders/init-app.js');


const server = app.listen (config.port, () => {
  console.log (`Express s'exécute sur le port ${server.address().port}`);
}); 
