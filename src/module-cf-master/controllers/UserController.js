const bcrypt = require('bcryptjs');
const { socketEmitRoom } = require('../../function/socketEmit')
const { JwtToken, JwtRefreshToken } = require('../../function/jwt');
const { 
        getUserByNameRepository, getUsersRepository, getUserByIdNumberRepository, getUserByIdRepository,
        postUserRepository, postFirstUserRepository, updateUserRepository, updateUserStatusRepository, postTokenBlackListRepository,
        getExistUsersRepository
      } = require('../repositories/UserRepository');
const { checkingExistingCompanyRepository, postComByFirstRegisterUserRepository } = require('../repositories/ComRepository')
const { users_default_password, company } = require('../../constants')
const { sequelize } = require('../../models');
const { getAllEmployeeRepository, postEmployeeByFirstRegisterUserRepository } = require('../../module-hr/repositories/EmployeeRegisterRepository');

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((item) => item && item.routePath && item.privilege);
};

const normalizeAuthUser = (user) => {
  if (!user || typeof user !== 'object') return null;

  const safeUser = { ...user };
  delete safeUser.password;

  const comType =
    safeUser['employees.branch_detail.com_type'] ??
    safeUser?.employees?.branch_detail?.com_type ??
    safeUser.com_type ??
    null;
  const comCode =
    safeUser['employees.branch_detail.com_code'] ??
    safeUser?.employees?.branch_detail?.com_code ??
    safeUser.branch_code ??
    null;
  const comName =
    safeUser['employees.branch_detail.com_name'] ??
    safeUser?.employees?.branch_detail?.com_name ??
    null;

  // keep both legacy flat keys and nested aliases during transition
  safeUser['employees.branch_detail.com_type'] = comType;
  safeUser['employees.branch_detail.com_code'] = comCode;
  safeUser['employees.branch_detail.com_name'] = comName;
  safeUser.branch_code = comCode;
  safeUser.com_type = comType;
  safeUser.branch_detail = {
    com_type: comType,
    com_code: comCode,
    com_name: comName,
  };

  const fn = String(
    safeUser["employees.first_name"] ?? safeUser?.employees?.first_name ?? ""
  ).trim();
  const mn = String(
    safeUser["employees.middle_name"] ?? safeUser?.employees?.middle_name ?? ""
  ).trim();
  const ln = String(
    safeUser["employees.last_name"] ?? safeUser?.employees?.last_name ?? ""
  ).trim();
  const nick = String(
    safeUser["employees.nick_name"] ?? safeUser?.employees?.nick_name ?? ""
  ).trim();
  const fromEmpReg = [fn, mn, ln].filter(Boolean).join(" ");
  safeUser.display_name =
    fromEmpReg || nick || safeUser.name || safeUser.username || "";

  return safeUser;
};

const buildAuthPayload = (user, permissions) => {
  const normalizedUser = normalizeAuthUser(user);
  return {
    user: normalizedUser,
    permissions: normalizePermissions(permissions),
    branchDetail: normalizedUser?.branch_detail || null,
  };
};

const loadPermissionsByRole = async (roleId) => {
  const { getAllRolePermissions } = require('../repositories/RbacRepository');
  if (!roleId) return [];

  try {
    return await getAllRolePermissions(roleId);
  } catch (permError) {
    console.error('Error loading permissions:', permError);
    return [];
  }
};

module.exports = {
  dummy: async(req, res) => {
    return res.status(201).json({ message: "dummy endpoint" });
  },

  session: async (req, res) => {
    const { name } = req.params;
    try {
      const user = await getUserByNameRepository(name);
      if(!user){
        return res.status(200).send({ message: "user does not exist" });
      }

      const permissions = await loadPermissionsByRole(user.role_id);
      return res.status(200).send({
        message: "user session",
        ...buildAuthPayload(user, permissions),
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  login: async(req, res) => {
    const { password, name } = req.body;

    try {
      const user = await getUserByNameRepository(name)
      if (!user) {
        return res.status(400).send({
          message: 'Incorect Username'
        });
      }
      
      if (user.status === 0) {
        return res.status(400).send({
          message: 'Log in failed: user is inactive.'
        });
      }
  
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).send({
          message: 'Incorrect password!',
        });
      }
  
      const permissions = await loadPermissionsByRole(user.role_id);

      const token = JwtToken(user.name, user.id, user.role_id)
      const refreshToken = JwtRefreshToken(user.name, user.id, user.role_id)

      return res
      .cookie("token", token, {
        httpOnly: true, // Tidak bisa diakses oleh JavaScript
        secure: process.env.NODE_ENV === "production", // Hanya aktif di HTTPS (harus true di production)
        sameSite: "Strict", // Tidak dikirim ke domain lain (gunakan "Lax" jika perlu sharing antar subdomain)
        maxAge: 20 * 24 * 60 * 60 * 1000, // 20 hari (jadikan saja 20 hari, agar tidak ada error jika akses token expire (alias terhapus/menghilang) dari cookies)
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "Strict", 
        maxAge: 20 * 24 * 60 * 60 * 1000, // 20 hari
      })
      .status(200).send({ 
        message: "Log in successful", 
        ...buildAuthPayload(user, permissions),
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).send({ 
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  },

  spesificUser: async(req, res) => {
    const { name } = req.body;
    try {
      let findUser = await getUserByNameRepository(name)
      if (!findUser) {
        return res.status(404).send({ message: "User does not exist", user: null, permissions: [] });
      }
      const permissions = await loadPermissionsByRole(findUser?.role_id);
      const token = JwtToken(findUser.name, findUser.id, findUser.role_id)
      return res
      .cookie("token", token, {
        httpOnly: true, // Tidak bisa diakses oleh JavaScript
        secure: process.env.NODE_ENV === "production", // Hanya aktif di HTTPS (harus true di production)
        sameSite: "Strict", // Tidak dikirim ke domain lain (gunakan "Lax" jika perlu sharing antar subdomain)
        maxAge: 20 * 24 * 60 * 60 * 1000, // 20 hari (kenapa 20 hari? lihat di login)
      })
      .status(200).send({
        message: "success refresh",
        ...buildAuthPayload(findUser, permissions),
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  logout: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        if (refreshToken) {
            await postTokenBlackListRepository(refreshToken);
        }

        res.clearCookie("token", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });

        if (req.user.name === req.body.name) {
            return res.status(200).json({ message: "Logout successful" });
        } else {
            return res.status(404).json({ message: "User wrong" });
        }
    } catch (err) {
      
      // Hapus cookie sebelum mengirim response
      res.clearCookie("token", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(500).send({ message: err.message });
    }
  },

  checkExistingAdmin: async (req, res) => {
    // yang diperlukan kondisi user belum di registrasi, makanya statusnya 200
    try {
      const users = await getExistUsersRepository()
      if (users.length === 1) {
        return res.status(404).send({
          message: "User Already Registered.",
        });
      }

      return res.status(200).send({
        message: "No registered users.",
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await getUsersRepository()
      if (users.length === 0) {
        return res.status(404).send({ message: "No registered users" });
      }
      
      return res.status(200).send({
        message: "Successfully fetched users.",
        data: users
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params
    try {
      const user = await getUserByIdRepository(id)
      if (!user) {
        return res.status(404).send({ message: "No registered user" });
      }
      
      return res.status(200).send({
        message: "Successfully fetch user.",
        data: user
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  getUsersPerBranch: async (req, res) => {
    const { branch_code } = req.params;
    try {
      const users = await getUsersRepository(branch_code)
      if (users.length === 0) {
        return res.status(404).send({ message: "No registered users" });
      }
  
      return res.status(200).send({
        message: "Successfully fetched users.",
        data: users
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  postUser: async (req, res) => {
    const { name, branch_code, id_number } = req.body
    try {
      const userCheckByName = await getUserByNameRepository(name)
      if(userCheckByName) {
        return res.status(409).send({
          message: "Username already exists. Please use a different one.",
        });
      } 
     
      const userCheckByUserIdNumber = await getUserByIdNumberRepository(id_number)
      if(userCheckByUserIdNumber) {
        return res.status(409).send({
          message: "Employee already registered. Please use a different one.",
        });
      } 

      await postUserRepository(req.body)
  
      socketEmitRoom(company, 'users', await getUsersRepository())
      socketEmitRoom(branch_code, `users_${branch_code}`, await getUsersRepository(branch_code))
      
      return res.status(200).send({
        message: 'Sucessfully created user.'
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  registrationFirstUser: async (req, res) => {
    const { name, first_name, last_name, id_number, role, branch_code, com_name } = req.body

    const transaction = await sequelize.transaction();
  
    try {
      const userCheck = await getExistUsersRepository()
      const companyCheck = await checkingExistingCompanyRepository()
      const employeeCheck = await getAllEmployeeRepository()
    
      if(userCheck.length !==0 || companyCheck.length !==0 || employeeCheck.length !==0){
        await transaction.rollback();
        return res.status(409).send({
          message: "User/Company/Employee Already Registered, please format database before for continue.",
        });
      }

      await postFirstUserRepository({name, id_number, role}, transaction)
      await postComByFirstRegisterUserRepository({branch_code, com_name, id_number}, transaction)
      await postEmployeeByFirstRegisterUserRepository({first_name, last_name, id_number, branch_code}, transaction)

      await transaction.commit();

      return res.status(200).send({
        message: 'Sucessfully created first user'
      });
    } catch (err) {
      await transaction.rollback();
      return res.status(500).send({ message: err.message });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    try {

      const user = await getUserByIdRepository(id)
      if (!user) {
        return res.status(404).send({ message: "No registered user" });
      }
      
      await  updateUserRepository(req.body, id)
      
      const branch_code = user['employees.branch_detail.branch_code']
    
      socketEmitRoom(company, 'users', await getUsersRepository())
      socketEmitRoom(branch_code, `users_${branch_code}`, await getUsersRepository(branch_code))

      socketEmitRoom(branch_code,`users_${id}`, await getUserByIdRepository(id))
      socketEmitRoom(company,`users_${id}`, await getUserByIdRepository(id))
      
       return res.status(200).send({
        message: "User successfully updated!",
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  updatePasswordUser: async (req, res) => {
    const { id_number, current_password, new_password } = req.body;
    
    try {
      const user = await getUserByIdNumberRepository(id_number)
      if (!user) {
        return res.status(404).send({
          message: 'User not found.',
        });
      }
  
      if (!bcrypt.compareSync(current_password, user.password)) {
        return res.status(400).send({
          message: 'Incorrect current password.',
        });
      }
  
      user.password = new_password;
      await user.save();  // This will trigger the beforeUpdate hook
      
      return res.status(200).send({
        message: "Successfully updated user password.",
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  resetPasswordUser: async (req, res) => {
    const { id_number } = req.params;
    
    try {
      const user = await getUserByIdNumberRepository(id_number)
      if (!user) {
        return res.status(404).send({
          message: 'User not found.',
        });
      }
  
      user.password = users_default_password;
      await user.save();  // This will trigger the beforeUpdate hook
      
      return res.status(200).send({
        message: "Successfully reset user password.",
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },

  updateStatusUser: async (req, res) => {
    const { status, remarks } = req.body;
    const { id } = req.params;
   
    try {
      const findUser = await getUserByIdRepository(id)
      if(!findUser) {
        return res.status(404).send({
          message: "User does not exist",
        });
      }

      const branch_code = findUser['employees.branch_code']
     
      await updateUserStatusRepository(status, remarks, id)
     
      socketEmitRoom(company, 'users', await getUsersRepository())
      socketEmitRoom(branch_code, `users_${branch_code}`, await getUsersRepository(branch_code))

      return res.status(200).send({
        message: "Successfully updated user status.",
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  },
};