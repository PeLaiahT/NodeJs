require('dotenv').config();
import nodemailer from 'nodemailer';


let sendEmail = async(data) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_APP, // generated ethereal user
          pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"NTK Medical 👻" <nguyenvuthai3004@gmail.com>', // sender address
        to: data.reciverEmail, // list of receivers
        subject: "Xác nhận thông tin đặt lịch khám bệnh", // Subject line
        html: getBodyEmail(data), 
      });
}
let getBodyEmail = (data) => {
    let result = '';
    if(data.language === 'vi'){
        result = `
        <h3>Xin chào ${data.patientName}!</h3>
        <p>Cảm ơn bạn đã đặt lịch khám bệnh trên trang web của chúng tôi</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${data.time}</b></div>
        <div><b>Bác sĩ: ${data.doctorName}</b></div>
        
        <p>Vui lòng click vào đường link bên dưới để hoàn tất thủ tục đặt lịch khám</p>
        <div>
        <a href=${data.redirectLink} target="_blank">Click here</a>
        </div>

        <div>Xin chân thành cảm ơn <3</div>
        `
    }
    if(data.language === 'en'){
        result = `
        <h3>Dear Sir/Madam ${data.patientName}!</h3>
        <p>Thank you for booking an appointment on our website</p>
        <p>Booking appointment information:</p>
        <div><b>Time: ${data.time}</b></div>
        <div><b>Doctor: ${data.doctorName}</b></div>
        
        <p>Please click on the link below to complete the booking procedure</p>
        <div>
        <a href=${data.redirectLink} target="_blank">Click here</a>
        </div>

        <div>Yours sincerely <3</div>
        `
    }
    return result;
}

module.exports = {
    sendEmail : sendEmail
}