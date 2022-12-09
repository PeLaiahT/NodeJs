import db, { Sequelize } from "../models/index";
import lodash,{concat} from "lodash";
require("dotenv").config();
import moment from 'moment';
import emailService from "../services/emailService";
import { Op } from "sequelize";
let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        limit: limitInput,
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password"],
        },
        raw: true,
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let checkInput = (inputData) => {
  let arr = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectedPrice",
    "selectedPayment",
    "selectedProvince",
    "nameClinic",
    "addressClinic",
    "specialtyId",
  ];
  let isValid = true;
  let element = "";
  for (let i = 0; i < arr.length; i++) {
    if (!inputData[arr[i]]) {
      isValid = false;
      element = arr[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};
let saveDetailInforDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = checkInput(inputData);
      if (check.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${check.element}`,
        });
      } else {
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorInfor = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });
          if (doctorInfor) {
            doctorInfor.contentHTML = inputData.contentHTML;
            doctorInfor.contentMarkdown = inputData.contentMarkdown;
            doctorInfor.description = inputData.description;
            doctorInfor.updateAt = new Date();
            await doctorInfor.save();
          }
        }

        let doctor = await db.Doctor_Infor.findOne({
          where: { doctorId: inputData.doctorId },
          raw: false,
        });
        if (doctor) {
          doctor.doctorId = inputData.doctorId;
          doctor.priceId = inputData.selectedPrice;
          doctor.provinceId = inputData.selectedProvince;
          doctor.paymentId = inputData.selectedPayment;
          doctor.nameClinic = inputData.nameClinic;
          doctor.addressClinic = inputData.addressClinic;
          doctor.note = inputData.note;
          doctor.specialtyId = inputData.specialtyId;
          doctor.clinicId = inputData.clinicId;
          await doctor.save();
        } else {
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            priceId: inputData.selectedPrice,
            provinceId: inputData.selectedProvince,
            paymentId: inputData.selectedPayment,
            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,
            specialtyId: inputData.specialtyId,
            clinicId: inputData.clinicId,
          });
        }
      }
      resolve({
        errCode: 0,
        errMessage: "Save infor doctor succed!",
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let doctor = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (doctor && doctor.image) {
          doctor.image = new Buffer(doctor.image, "base64").toString("binary");
        }
        if (!doctor) data = {};
        resolve({
          errCode: 0,
          data: doctor,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required param !",
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((i) => {
            i.maxNumber = 10;
            i.currentNumber = 0;
            return i;
          });
        }
        let scheduleEx = {};
        for (let i = 0; i < schedule.length; i++) {
          let scheduleExisting = await db.Schedule.findAll({
            where: { doctorId: data.doctorId, date: schedule[i].date },
            attributes: ["timeType", "date", "doctorId", "maxNumber", "currentNumber"],
            raw: true,
          });
          scheduleEx = concat(scheduleEx, scheduleExisting);
        }
        let result = lodash.differenceWith(schedule, scheduleEx, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });
        if (result && result.length > 0) {
          await db.Schedule.bulkCreate(result);
        }
      }
      resolve({
        errCode: 0,
        errMessage: "Success",
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let schedules = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!schedules) data = [];
        resolve({
          errCode: 0,
          data: schedules,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getExtraInforDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorId: inputId,
          },
          attributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!doctorInfor) data = {};
        resolve({
          errCode: 0,
          data: doctorInfor,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getProfileDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let doctor = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (doctor && doctor.image) {
          doctor.image = new Buffer(doctor.image, "base64").toString("binary");
        }
        if (!doctor) data = {};
        resolve({
          errCode: 0,
          data: doctor,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: "S2",
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: ["email", "firstName", "address", "gender","lastName"],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataPatient",
              attributes: ["valueEn","valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        resolve({
          errCode: 0,
          errMessage: "OK",
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let sendRemedy = (data) => {
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
        !data.patientId ||
        !data.timeType ||
        !data.imgBase64
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: "S2",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S3";
          await appointment.save();
        }
        scheduleEx.currentNumber = scheduleEx.currentNumber - 1;
        await scheduleEx.save();
        await emailService.sendAttachment(data);

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let handleDeleteSchedule = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
      try {
          if (!doctorId || !date) {
              resolve({
                  errCode: 1,
                  errMessage: 'Missing required parameter'
              })
          } else {
              let schedules = await db.Schedule.findAll({
                  where: {
                      doctorId: doctorId,
                      date: date
                  },
                  raw: false
              })
              if (schedules || schedules.length > 0) {
                  await db.Schedule.destroy({
                      where: {
                          doctorId: doctorId,
                          date: date
                      }
                  })
              }
              let bookingExsiting = await db.Booking.findAll({
                  where: {
                      doctorId: doctorId,
                      date: date,
                      statusId: {
                          [Op.or]: [
                              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('statusId')), 'LIKE', 's1%'),
                              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('statusId')), 'LIKE', 's2%'),
                          ],
                      },
                  },
                  include: [
                      {
                          model: db.User, as: 'doctorBookingData', attributes: { exclude: ["password", "image"] }
                      },
                      {
                          model: db.User, as: 'patientData',
                          attributes: { exclude: ["password", "image"] }
                      },
                      {
                          model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi']
                      }
                  ],

                  raw: false,
                  nest: true
              })

              if (bookingExsiting) {
                  for (let i = 0; i < bookingExsiting.length; i++) {
                      bookingExsiting[i].statusId = 'S4';
                      await bookingExsiting[i].save();
                      await emailService.sendCancelEmail(bookingExsiting[i].patientData.email,
                          concat(bookingExsiting[i].patientData.lastName + ' ' + bookingExsiting[i].patientData.firstName),
                          concat(bookingExsiting[i].doctorBookingData.lastName + ' ' + bookingExsiting[i].doctorBookingData.firstName),
                          concat(moment.unix((bookingExsiting[0].date) / 1000).format("DD/MM/YYYY") + ' ' + bookingExsiting[0].timeTypeDataPatient.valueVi)
                      )
                  }
              }
              resolve({
                  errCode: 0,
                  message: "Schedule is deleted!"
              })
          }
      } catch (error) {
          reject(error);
      }
  })
}
let handleDeleteTime = (doctorId, date, timeType) => {
  return new Promise(async (resolve, reject) => {
      try {
          if (!doctorId || !date || !timeType) {
              resolve({
                  errCode: 1,
                  errMessage: "Missing required parameter"
              })
          } else {
              let schedule = await db.Schedule.findOne({
                  where: {
                      doctorId: doctorId,
                      date: date,
                      timeType: timeType
                  }
              })
              if (!schedule) {
                  resolve({
                      errCode: 2,
                      errMessage: "No time exsit!"
                  })
              } else {
                  await db.Schedule.destroy({
                      where: {
                          doctorId: doctorId,
                          date: date,
                          timeType: timeType
                      }
                  })
                  resolve({
                      errCode: 0,
                      errMessage: "Delete time success!"
                  })
                  let bookingExsiting = await db.Booking.findAll({
                      where: {
                          doctorId: doctorId,
                          date: date,
                          timeType: timeType,
                          statusId: {
                              [Op.or]: [
                                  Sequelize.where(
                                      Sequelize.fn("LOWER", Sequelize.col("statusId")),
                                      "LIKE",
                                      "s1%"
                                  ),
                                  Sequelize.where(
                                      Sequelize.fn("LOWER", Sequelize.col("statusId")),
                                      "LIKE",
                                      "s2%"
                                  ),
                              ],
                          }
                      },
                      include: [
                          {
                              model: db.User, as: 'doctorBookingData', attributes: { exclude: ["password", "image"] }
                          },
                          {
                              model: db.User, as: 'patientData',
                              attributes: { exclude: ["password", "image"] }
                          },
                          {
                              model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi']
                          }
                      ],

                      raw: false,
                      nest: true
                  });
                  if (bookingExsiting) {
                      for (let i = 0; i < bookingExsiting.length; i++) {
                          bookingExsiting[i].statusId = "S4";
                          await bookingExsiting[i].save();
                          await emailService.sendCancelEmail(bookingExsiting[i].patientData.email,
                              concat(bookingExsiting[i].patientData.lastName + ' ' + bookingExsiting[i].patientData.firstName),
                              concat(bookingExsiting[i].doctorBookingData.lastName + ' ' + bookingExsiting[i].doctorBookingData.firstName),
                              concat(moment.unix((bookingExsiting[0].date) / 1000).format("DD/MM/YYYY") + ' ' + bookingExsiting[0].timeTypeDataPatient.valueVi)
                          )
                      }
                  }
              }

          }
      } catch (error) {
          reject(error)
      }
  })
}
module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctor: saveDetailInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
  handleDeleteSchedule: handleDeleteSchedule,
  handleDeleteTime : handleDeleteTime
};
