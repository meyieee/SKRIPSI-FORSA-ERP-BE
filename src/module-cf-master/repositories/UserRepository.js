const User = require('../models/User');
const TokenBlackLists = require('../models/token_blacklists')
const EmployeeRegister = require("../../module-hr/models/tbl_emp_regs");
const { users_default_password } = require('../../constants')
const { getModelCom, getModelDepartment } = require('../../function/getIncludeModels')

module.exports = {
    getUserByNameRepository: async(name) => {
        return await User.findOne({ 
          where: { name },
          raw: true,
          include: [
            {
              model: EmployeeRegister,
              as: 'employees',
              attributes: [
                'dept_code',
                'id_number',
                'status',
                'photo',
                'first_name',
                'middle_name',
                'last_name',
                'nick_name',
              ],
              include: [
                getModelCom('branch_detail', ['com_type', 'com_name', 'com_code'])
              ]
            },
          ]
        });
      },

    getExistUsersRepository: async()=>{
      return await User.findAll({
          raw: true,
          attributes: ['id_number', 'name'],
        });
    },

    getUsersRepository: async (branch_code) => {
    const whereClause = branch_code ? { branch_code } : {};
      return await User.findAll({
        raw: true,
        order: [['status', 'DESC']],
        include: [
          {
            model: EmployeeRegister,
            as: 'employees',
            required: true, // Mengharuskan User memiliki EmployeeRegister
            attributes: ['dept_code', 'id_number', 'photo'],
            where: whereClause, // Filter langsung di EmployeeRegister
            include: [
              getModelCom('branch_detail', ['com_type', 'com_name', 'com_code']),
              getModelDepartment('department_detail', ['dept_des', 'dept_code'])
            ],
          },
        ],
      });
    },

    getUserByIdNumberRepository: async(id_number)=>{
      return await User.findOne({ where: { id_number }});
    },

    getUserByIdRepository: async(id)=>{
      return await User.findOne({ 
        where: { id },
        raw: true,
        attributes: { exclude: ['password'] }, // Mengecualikan password
        include: [
          {
            model: EmployeeRegister,
            as: 'employees',
            required: true, // Mengharuskan User memiliki EmployeeRegister
            attributes: [], // tidak perlu membawa atribut dari employees
            include: [
              getModelCom('branch_detail', ['com_code', 'com_name']),
              getModelDepartment('department_detail', ['dept_des', 'dept_code'])
            ]
          },
        ],
      });
    },
    
    postUserRepository: async(data)=>{
      const { name, id_number, role } = data
      await User.create({id_number, name, password: users_default_password, role, status: true});
    },

    postFirstUserRepository: async(data, transaction)=>{
      const { name, id_number, role } = data
      await User.create({id_number, name, password: users_default_password, role, status: true},{ transaction });
    },

    updateUserRepository: async(data, id)=>{
      await User.update(data, {where: {id}});
    },
  
    updateUserStatusRepository: async(status, remarks, id )=>{
     await User.update({status, remarks}, { where: { id } });
    },

    deleteUserRepository: async( id )=>{
     await User.destroy({where: {id}});
    },

    postTokenBlackListRepository: async( token )=>{
      await TokenBlackLists.create({token});
    },

    getTokenByTokenRepository: async (token) => {
      return await TokenBlackLists.findOne({ where: { token }, attributes:['token'], raw: true });
    },
};