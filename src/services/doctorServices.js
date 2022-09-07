import db from "../models/index";
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
let saveDetailInforDoctor = (inputData) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!inputData.doctorId || !inputData.contentHTML || !inputData.contentMarkdown || !inputData.action){
                resolve({
                    errCode : 1,
                    errMessage: 'Missing parameter'
                })
            }else{
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
                
                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor succed!'
                })
            }
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
                    ],
                    raw : false,
                    nest : true
                })
                if(doctor && doctor.image){
                    doctor.image = new Buffer(doctor.image, 'base64').toString('binary');
                }
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
module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors : getAllDoctors,
    saveDetailInforDoctor : saveDetailInforDoctor,
    getDetailDoctorById : getDetailDoctorById
}