import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
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
let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let buildCancelUrlEmail = (patientId, token, date, timeType, doctorId) => {
  let result = `${process.env.URL_REACT}/verify-cancel-booking?token=${token}&patientId=${patientId}&date=${date}&timeType=${timeType}&doctorId=${doctorId}`;
  return result;
};
let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let scheduleEx = await db.Schedule.findOne({
        where: {
          doctorId: data.doctorId,
          date: data.date,
          timeType: data.timeType
        },
        raw: false
      })
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address ||
        !data.reason
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let passwordHash = await hashUserPassword("123456");
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
            address: data.address,
            gender: data.selectedGender,
            firstName: data.fullName,
            password: passwordHash,
            phonenumber: data.phoneNumber,
          },
        });
        if (user && user[0]) {
          if (scheduleEx.currentNumber >= scheduleEx.maxNumber) {
            resolve({
              errCode: 2,
              errMessage: "The schedule is full, Please choose another time!"
            })
          } else {
            let token = uuidv4();
            await db.Booking.findOrCreate({
              where: { patientId: user[0].id, date: data.date, timeType: data.timeType },
              defaults: {
                statusId: "S1",
                patientId: user[0].id,
                doctorId: data.doctorId,
                date: data.date,
                timeType: data.timeType,
                reason : data.reason,
                token: token,
              },
            });
            scheduleEx.currentNumber = scheduleEx.currentNumber + 1;
            await scheduleEx.save();
            await emailService.sendEmail({
              reciverEmail: data.email,
              patientName: data.fullName,
              time: data.timeString,
              doctorName: data.doctorName,
              language: data.language,
              redirectLink: buildUrlEmail(data.doctorId, token),
            });
            resolve({
              errCode: 0,
              errMessage: "Save booking appointment success!",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: -1,
          errMessage: "Missing parameter",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();
          resolve({
            errCode: 0,
            errMessage: "Update the appointment succed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "The appointment is already updated or not exist!",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getListScheduleForPatient = (patientId, status) => {
  return new Promise(async (resolve, reject) => {
    try {

      if (!patientId || !status) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter"
        })
      }
      if (status === "ALL") {
        let data = await db.Booking.findAll({
          where: {
            patientId: patientId
          },
          include: [
            {
              model: db.User, as: 'doctorBookingData',
              attributes: { exclude: ["password", "image"] }
            },
            {
              model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi']
            }
          ],
          raw: false,
          nest: false
        })
        resolve({
          errCode: 0,
          errMessage: 'OK',
          data
        })

      } else {
        let data = await db.Booking.findAll({
          where: {
            patientId: patientId,
            statusId: status
          },
          include: [
            {
              model: db.User, as: 'doctorBookingData', attributes: { exclude: ["password", "image"] }
            },
            {
              model: db.Allcode, as: 'timeTypeDataPatient',
              attributes: ["valueVi", "valueEn"]
            }
          ],
          raw: false,
          nest: false
        })

        resolve({
          errCode: 0,
          errMessage: 'OK',
          data
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}
let postCancelBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId || !data.patientId || !data.timeString || !data.doctorName || !data.date || data.timType) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let booking = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            token: data.token
          },
          raw: false
        })
        if (booking) {
          booking.statusId = "S5";
          await booking.save();
          await emailService.sendCancelEmailForDoctor({
            reciverEmail: data.email,
            time: data.timeString,
            doctorName: data.doctorName,
            redirectLink: buildCancelUrlEmail(data.patientId, data.token, data.date, data.timType),
          });
          resolve({
            errCode: 0,
            errMessage: "Cancel requrest have been created!"
          })
        }
      }
    } catch (error) {
      reject(error);
    }
  })
}
let postVerifyCancelBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.patientId || !data.date || !data.timeType || !data.doctorId) {
        resolve({
          errCode: -1,
          errMessage: "Missing parameter",
        });
      } else {
        let scheduleEx = await db.Schedule.findOne({
          where: {
            doctorId: data.doctorId,
            date: data.date,
            timeType: data.timeType
          },
          raw: false
        });
        let appointment = await db.Booking.findOne({
          where: {
            patientId: data.patientId,
            token: data.token,
            statusId: "S5",
          },
          raw: false
        });
        if (appointment) {
          appointment.statusId = "S4";
          await appointment.save();
          scheduleEx.currentNumber = scheduleEx.currentNumber - 1;
          await scheduleEx.save();
          resolve({
            errCode: 0,
            errMessage: "The the appointment have been removed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "The appointment is already deleted or not exist!",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getListScheduleForPatient: getListScheduleForPatient,
  postCancelBookAppointment: postCancelBookAppointment,
  postVerifyCancelBookAppointment: postVerifyCancelBookAppointment
};
