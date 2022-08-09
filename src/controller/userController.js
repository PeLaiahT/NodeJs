import userService from "../services/userServices";

let handleLogin = async (req,res) =>{
    let email = req.body.email;
    let password = req.body.password;
    if(!email || !password){
        return res.status(500).json({
            errCode: 1,
            message: 'Please input email or password!'
        })
    }
    let userData = await userService.handleUserLogin(email,password);
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}
let handleGetAllUsers = async (req,res) =>{
    let id = req.query.id; //Get 1 user or all users
    if(!id){
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters',
            users: []
        })
    }
    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'Ok',
        users
    })
}
let handleCreateNewUser = async (req,res) =>{
    let msg = await userService.createNewUser(req.body);
    return res.status(200).json(msg);
}
let handleDeleteUser = async (req,res) =>{
    if(!req.body.id){
        return req.status(200).json({
            errCode: 1,
            errMessage: "Missing required id!"
        })
    }
    let msg = await userService.deleteUser(req.body.id);
    return res.status(200).json(msg);
}
let handleEditUser = async (req,res)=>{
    let data = req.body;
    let message = await userService.updateUser(data);
    return res.status(200).json(message)
}
module.exports = {
    handleLogin : handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser
}