const { Model, DataTypes } = require('sequelize');

class token_blacklists extends Model {
    static init(sequelize) {
        super.init({
            token: DataTypes.STRING,
        }, {
            sequelize
        })
    }
    static associate(models) {}
}

module.exports = token_blacklists;
