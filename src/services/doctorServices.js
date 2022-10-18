import db from "../models/index";
import lodash, { reject } from 'lodash';
require('dotenv').config();
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
        let doctors = await db.User.findAll({
            limit: limitInput,
            where: {roleId: 'R2'},
            order: [['createdAt', 'DESC']],
            attributes: {
                exclude: ['password', 'image']
            },
            include: [
                {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                {model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']},
            ],
            raw: true,
            nest: true
        })
        resolve({
            errCode: 0,
            data: doctors
        })
        } catch (error) {
            reject(error);
        }
    })
}
let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId : 'R2' },
                attributes: {
                    exclude : ['password', 'image']
                },
                raw: true
            })
            resolve ({
                errCode : 0,
                data : doctors
            })
        } catch (error) {
            reject(error);
        }
    })
}
let checkInput = (inputData) =>{
    let arr = ['doctorId','contentHTML','contentMarkdown','action','selectedPrice','selectedPayment','selectedProvince','nameClinic','addressClinic','specialtyId'];
    let isValid = true;
    let element = '';
    for(let i=0; i< arr.length; i++){
        if(!inputData[arr[i]]){
            isValid = false;
            element = arr[i];
            break;
        }
    }
    return {
        isValid: isValid,
        element: element
    }
}
let saveDetailInforDoctor = (inputData) => {
    return new Promise(async(resolve, reject) => {
        try {
            let check = checkInput(inputData);
            if(check.isValid === false){
                resolve({
                    errCode : 1,
                    errMessage: `Missing parameter: ${check.element}`
                })
            } else {
                if(inputData.action === 'CREATE'){
                    await db.Markdown.create({
                        contentHTML : inputData.contentHTML,
                        contentMarkdown : inputData.contentMarkdown,
                        description : inputData.description,
                        doctorId : inputData.doctorId
                    })
                }else if(inputData.action === 'EDIT'){
                    let doctorInfor = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId},
                        raw: false
                    })
                    if(doctorInfor){
                        doctorInfor.contentHTML = inputData.contentHTML;
                        doctorInfor.contentMarkdown = inputData.contentMarkdown;
                        doctorInfor.description = inputData.description;
                        doctorInfor.updateAt = new Date();
                        await doctorInfor.save();
                    }
                }

                let doctor = await db.Doctor_Infor.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false
                    })
                    if(doctor){
                        doctor.doctorId = inputData.doctorId;
                        doctor.priceId = inputData.selectedPrice;
                        doctor.provinceId = inputData.selectedProvince;
                        doctor.paymentId = inputData.selectedPayment;
                        doctor.nameClinic = inputData.nameClinic;
                        doctor.addressClinic = inputData.addressClinic;
                        doctor.note = inputData.note;
                        doctor.specialtyId = inputData.specialtyId,
                        doctor.clincId = inputData.clincId
                        await doctor.save();
                    } else {
                        await db.Doctor_Infor.create({
                            doctorId : inputData.doctorId,
                            priceId : inputData.selectedPrice,
                            provinceId : inputData.selectedProvince,
                            paymentId : inputData.selectedPayment,
                            nameClinic : inputData.nameClinic,
                            addressClinic : inputData.addressClinic,
                            note : inputData.note,
                            specialtyId: inputData.specialtyId,
                            clincId: inputData.clincId
                        })
                    }
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor succed!'
                })
        } catch (error) {
            reject(error);
        }
    })
}
let getDetailDoctorById = (inputId) => {
    return new Promise(async(resolve, reject)=>{
        try {
            if(!inputId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let doctor = await db.User.findOne({
                    where: {
                        id : inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown']},
                        {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Doctor_Infor, 
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                            ]
                        },
                    ],
                    raw : false,
                    nest : true
                })
                if(doctor && doctor.image){
                    doctor.image = new Buffer(doctor.image, 'base64').toString('binary');
                }
                if(!doctor) data = {};
                resolve({
                    errCode : 0,
                    data: doctor
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}
let bulkCreateSchedule = (data) => {
    return new Promise(async(resolve, reject)=>{
        try {
            if(!data.arrSchedule || !data.doctorId || !data.formatedDate){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required param !'
                })
            } else {
                let schedule = data.arrSchedule;
                if(schedule && schedule.length > 0){
                    schedule = schedule.map(i => {
                        i.maxNumber = MAX_NUMBER_SCHEDULE;
                        return i;
                    })
                }
                let scheduleExisting = await db.Schedule.findAll({
                    where:  {doctorId: data.doctorId, date: data.formatedDate},
                    attributes: ['timeType', 'date', 'doctorId','maxNumber'],
                    raw: true
                });
                let result = lodash.differenceWith(schedule, scheduleExisting, (a,b)=>{
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                if(result && result.length > 0){
                    await db.Schedule.bulkCreate(result);
                } 
            }
            resolve({
                errCode: 0,
                errMessage: 'Success'
            })
        } catch (error) {
            reject(error);
        }
    })
}
let getScheduleByDate = (doctorId, date) => {
    return new Promise(async(resolve,reject)=>{
        try {
            if(!doctorId || !date){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            }else{
                let schedules = await db.Schedule.findAll({
                    where : {
                        doctorId : doctorId,
                        date : date
                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn','valueVi']},
                        { model: db.User, as: 'doctorData', attributes: ['firstName','lastName']},
                    ],
                    raw: false,
                    nest: true
                })
                if(!schedules) data = [];
                resolve({
                    errCode : 0,
                    data: schedules
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}
let getExtraInforDoctorById = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!inputId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId : inputId
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                    ],
                    raw: false,
                    nest: true
                })
                if(!doctorInfor) data = {};
                resolve({
                    errCode: 0,
                    data : doctorInfor
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
let getProfileDoctorById = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!inputId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let doctor = await db.User.findOne({
                    where: {
                        id : inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown']},
                        {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},
                            ]
                        },
                    ],
                    raw: false,
                    nest: true
                })
                if(doctor && doctor.image){
                    doctor.image = new Buffer(doctor.image, 'base64').toString('binary');
                }
                if(!doctor) data = {};
                resolve({
                    errCode: 0,
                    data : doctor
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors : getAllDoctors,
    saveDetailInforDoctor : saveDetailInforDoctor,
    getDetailDoctorById : getDetailDoctorById,
    bulkCreateSchedule : bulkCreateSchedule,
    getScheduleByDate : getScheduleByDate,
    getExtraInforDoctorById : getExtraInforDoctorById,
    getProfileDoctorById : getProfileDoctorById
    
}