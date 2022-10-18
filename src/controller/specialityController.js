import specialtyService from "../services/SpecialityServices"
let createSpeciality = async(req, res) => {
    try {
        let infor = await specialtyService.createSpeciality(req.body);
        return res.status(200).json(infor)
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errMessage: 'Error from the sever'
        })
    }
}
let getAllSpecialty = async(req, res) =>{
    try {
        let infor = await specialtyService.getAllSpecialty(req.body);
        return res.status(200).json(infor)
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errMessage: 'Error from the sever'
        })
    }
}
let getDetailSpecialtyById = async(req,res) => {
    try {
        let infor = await specialtyService.getDetailSpecialtyById(req.query.id,req.query.location);
        return res.status(200).json(infor)
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errMessage: 'Error from the sever'
        })
    }
}
module.exports = {
    createSpeciality : createSpeciality,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById
}