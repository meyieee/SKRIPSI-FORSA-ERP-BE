const { literal } = require('sequelize');

const getAttributeEmployeeFullName = (alias) => {
  const tableAlias = alias || 'reg_by_detail';

  return literal(
    `CONCAT_WS(
      ' ',
      NULLIF(\`${tableAlias}\`.\`first_name\`, ''),
      NULLIF(\`${tableAlias}\`.\`middle_name\`, ''),
      NULLIF(\`${tableAlias}\`.\`last_name\`, '')
    )`
  );
};


module.exports = { getAttributeEmployeeFullName };
