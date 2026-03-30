module.exports = {
  development: {
    host: process.env.DEV_DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DEV_DB_USER,
    password: '',
    logging: false, // menonaktifkan log
    dialect: 'mysql',
    dialectOptions: { decimalNumbers: true }, //enable decimal number
    define: {
      timestamps: true, // to enable reading createdAt & updatedAt fields
      underscored: true,
    }
  },
  test: {
    host: process.env.TESTING_DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.TESTING_DB_NAME,
    username: process.env.TESTING_DB_USER,
    password: process.env.TESTING_DB_PASSWORD,
    logging: false, // menonaktifkan log
    dialect: 'mysql',
    dialectOptions: { decimalNumbers: true }, //enable decimal number
    define: {
      timestamps: true, // to enable reading createdAt & updatedAt fields
      underscored: true,
    }
  },
  production: {
    host: process.env.PROD_DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    logging: false,
    dialect: "mysql",
    dialectOptions: { decimalNumbers: true },
    define: {
      timestamps: true,
      underscored: true,
    },
  }
};