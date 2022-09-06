import doctorService from "../services/doctorServices";

let getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit;
    if(!limit) limit = 10;
    try {
        let respone =  await doctorService.getTopDoctorHome(+limit);
        return res.status(200).json(respone);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server...'
        })
    }
}
let getAllDoctors = async(req, res) => {
    try {
        let doctors = await doctorService.getAllDoctors();
        return res.status(200).json(doctors)
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from sever'
        })
    }
}

let postInforDoctor = async(req, res) => {
    try {
        let respone = await doctorService.saveInforDoctor(req.body);
        return res.status(200).json(respone);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from sever'
        })
    }
}

let getDetailDoctorById = async(req, res) => {
    try {
        let doctor = await doctorService.getDetailDoctorById(req.query.id);
        return res.status(200).json(doctor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}
module.exports = {
    getTopDoctorHome : getTopDoctorHome,
    getAllDoctors : getAllDoctors,
    postInforDoctor : postInforDoctor,
    getDetailDoctorById : getDetailDoctorById
}