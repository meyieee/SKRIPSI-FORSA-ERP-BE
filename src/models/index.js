// src/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.js'))[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load models dari models utama
const loadModelsRecursively = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadModelsRecursively(fullPath);
    } else if (file !== basename && file.endsWith('.js')) {
      const model = require(fullPath);
      if (typeof model.init === 'function') {
        model.init(sequelize);
        db[model.name] = model;
      }
    }
  });
};

// Scan folder model global
loadModelsRecursively(__dirname);

// Tambahkan module-module SCM lain secara manual (bertahap)
const modules = [
  'module-hr',
  'module-cf-master',
  'module-cf-hr',
  'module-fia-home',
  'module-fia-resource',
];

modules.forEach(moduleName => {
  const moduleModelPath = path.join(__dirname, `../${moduleName}/models`);
  if (fs.existsSync(moduleModelPath)) {
    loadModelsRecursively(moduleModelPath);
  }
});

// Panggil associate jika ada
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

//// CODE LAMA SECARA DEFAULT

// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const { Sequelize } = require('sequelize');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(path.join(__dirname, '/../config/config.js'))[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file));
//     model.init(sequelize);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;
