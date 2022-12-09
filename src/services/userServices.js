import db from "../models/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const salt = bcrypt.genSaltSync(10);
let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
};
let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = '';
            let userData = [];
            let isExist = await checkUserEmail(email);
            if (isExist) {
                let user = await db.User.findOne({
                    attributes: ["id", "email", "roleId", "password", "firstName", "lastName"],
                    where: { email: email },
                    raw: true,
                });
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        userData.errCode = 0;
                        (userData.errMessage = "Login succesfull"), delete user.password;
                        userData.user = user;
                        token = jwt.sign(
                            { userId: user.id, roleId: user.roleId },
                            "bolathai199x"
                        );
                        userData.token = token;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = "Password is wrong";
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = "User not found!";
                }
            } else {
                userData.errCode = 1;
                userData.errMessage = "Your's email not exist";
            }
            console.log(userData, 'userData');
            resolve(
                userData
            );
        } catch (error) {
            reject(error);
        }
    });
};
let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail },
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};
let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = [];
            if (userId === "ALL") {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }
            if (userId && userId !== "ALL") {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: "genderData",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                    raw: false,
                });
            }
            if (users.image && users) {

                users.image = new Buffer(users.image, "base64").toString(
                    "binary"
                );

            }
            resolve(users);
        } catch (error) {
            reject(error);
        }
    });
};
let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: "Your email is already in use!",
                });
            } else {
                let passwordHash = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: passwordHash,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.role,
                    positionId: data.position,
                    DoB: data.dob,
                    image: data.avatar,
                });
            }
            resolve({
                errCode: 0,
                errMessage: "Ok",
            });
        } catch (error) {
            reject(error);
        }
    });
};
let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId },
        });
        if (!user) {
            resolve({
                errCode: 2,
                errMessage: "User isn't exist!",
            });
        }
        await db.User.destroy({
            where: { id: userId },
        });
        resolve({
            errCode: 0,
            errMessage: "The user is deleted!",
        });
    });
};
let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing required id!",
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false,
            });
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                user.DoB = data.dob;
                if (data.avatar) {
                    user.image = data.avatar;
                }
                await user.save();
                resolve({
                    errCode: 0,
                    errMessage: "Update user succeeds!",
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: "User not found",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};
let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter !",
                });
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput },
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (error) {
            reject(error);
        }
    });
};
let handleUpdateInfor = (data) => {

    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing required id!",
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false,
            });
            if (user) {
                let check = await bcrypt.compareSync(data.currentPassword, user.password);
                if (check) {
                    if (data.newPassword !== data.confirmPassword) {
                        resolve({
                            errCode: 4,
                            errMessage: "The new password and the confirmation password are not match, please try again!"
                        })
                    } else {
                        let newPw = await hashUserPassword(data.newPassword)
                        user.firstName = data.firstName;
                        user.lastName = data.lastName;
                        user.address = data.address;
                        user.gender = data.gender;
                        user.phonenumber = data.phonenumber;
                        user.password = newPw;
                        if (data.avatar) {
                            user.image = data.avatar;
                        }
                        await user.save();
                        resolve({
                            errCode: 1,
                            errMessage: "Update Information successfull!"
                        })
                    }
                } else {
                    resolve({
                        errCode: 3,
                        errMessage: "Current password is wrong!"
                    })
                }
            }
        } catch (error) {
            reject(error);
        }

    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUser: updateUser,
    getAllCodeService: getAllCodeService,
    handleUpdateInfor: handleUpdateInfor
};