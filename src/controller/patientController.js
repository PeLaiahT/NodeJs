import patientServices from "../services/patientServices";

let postBookAppointment = async (req, res) => {
  try {
    let infor = await patientServices.postBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
let postVerifyBookAppointment = async (req, res) => {
  try {
    let infor = await patientServices.postVerifyBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
let getListScheduleForPatient = async (req, res) => {
  try {
    let infor = await patientServices.getListScheduleForPatient(req.query.patientId, req.query.status);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
}
let postCancelBookAppointment = async (req, res) => {
  try {
    let infor = await patientServices.postCancelBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
}
let postVerifyCancelBookAppointment = async (req, res) => {
  try {
    let infor = await patientServices.postVerifyCancelBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
}
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getListScheduleForPatient: getListScheduleForPatient,
  postCancelBookAppointment: postCancelBookAppointment,
  postVerifyCancelBookAppointment: postVerifyCancelBookAppointment
};
