require("dotenv").config();
import nodemailer from "nodemailer";

let sendEmail = async (data) => {
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
};
let sendCancelEmailForDoctor = async (data) => {
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
    subject: "Yêu cầu Xác nhận thông tin hủy lịch khám bệnh của khách hàng", // Subject line
    html: `
    <h3>Xin chào ${data.doctorName}!</h3>
    <p>Vì người dùng đã gửi yêu cầu hủy lịch khám qua hệ thống, bác sĩ phụ trách vui lòng click vào đường link bên dưới để hủy lịch hẹn</p>
    <p>Thông tin lịch khám bệnh đã hủy:</p>
    <div><b>Thời gian: ${time}</b></div>
   
    <div>
        <a href=${data.redirectLink} target="_blank">Click here</a>
    </div>

    <p>Rất xin lỗi vì sự cố nàyi</p>
    
    <div>Xin chân thành cảm ơn <3</div>
    `
  });
};
let sendCancelEmail = async (patientEmail,patientName,doctorName,time) => {
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
    to: patientEmail, // list of receivers
    subject: "Thông báo hủy lịch khám đã đặt", // Subject line
    html: `
    <h3>Xin chào ${patientName}!</h3>
    <p>Cảm ơn bạn đã đặt lịch khám bệnh trên trang web của chúng tôi</p>
   
    <div>Chúng tôi rất xin lỗi khi phải thông báo rằng lịch khám dưới đây của bạn đã hủy do Bác sĩ phụ trách của bạn có việc đột xuất </div>
    <p>Thông tin lịch khám bệnh đã hủy:</p>
    <div><b>Thời gian: ${time}</b></div>
    <div><b>Bác sĩ: ${doctorName}</b></div>

    <p>Rất xin lỗi vì sự cố này, bạn có thể đặt lịch khám khác ở trên ứng dụng của chúng tôi</p>
    
    <div>Xin chân thành cảm ơn <3</div>
    `
  });
};
let getBodyEmail = (data) => {
  let result = "";
  if (data.language === "vi") {
    result = `
        <h3>Xin chào ${data.patientName}!</h3>
        <p>Cảm ơn bạn đã đặt lịch khám bệnh trên trang web của chúng tôi</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${data.time}</b></div>
        <div><b>Bác sĩ: ${data.doctorName}</b></div>

        <div>Nếu bạn lần đầu tiên đặt lịch trên ứng dụng của chúng tôi:</div>
        <div>Tên đăng nhập mặc định: ${data.reciverEmail}</div>
        <div>Mật khẩu mặc định: 123456</div>

        <p>Vui lòng click vào đường link bên dưới để hoàn tất thủ tục đặt lịch khám</p>
        <div>
        <a href=${data.redirectLink} target="_blank">Click here</a>
        </div>

        <div>Xin chân thành cảm ơn <3</div>
        `;
  }
  if (data.language === "en") {
    result = `
        <h3>Dear Sir/Madam ${data.patientName}!</h3>
        <p>Thank you for booking an appointment on our website</p>
        <p>Booking appointment information:</p>
        <div><b>Time: ${data.time}</b></div>
        <div><b>Doctor: ${data.doctorName}</b></div>
        
        <div>If it is a first time you booking in our application:</div>
        <div>Default Username: ${data.reciverEmail}</div>
        <div>Default Password: 123456</div>

        <p>Please click on the link below to complete the booking procedure</p>
        <div>
        <a href=${data.redirectLink} target="_blank">Click here</a>
        </div>

        <div>Yours sincerely <3</div>
        `;
  }
  return result;
};
let sendAttachment = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
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
        to: data.email, // list of receivers
        subject: "Kết quả đặt lịch khám bệnh", // Subject line
        html: getBodyEmailRemedy(data),
        attachments: [
          {
            filename: `${data.patientId}-${new Date().getTime()}.png`,
            content: data.imgBase64.split("base64,")[1],
            encoding: "base64",
          },
        ],
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
let getBodyEmailRemedy = (data) => {
  let result = "";
  if (data.language === "vi") {
    result = `
      <h3>Xin chào ${data.patientName}!</h3>
      <p>Cảm ơn bạn đã tin dùng sử dụng dịch vụ của chúng tôi</p>
      <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm</p>
      

      <div>Xin chân thành cảm ơn <3</div>
      `;
  }
  if (data.language === "en") {
    result = `
      <h3>Dear Sir/Madam ${data.patientName}!</h3>
      <p>Thank you for using our service</p>
      <p>Prescription/invoice information is included in the attached file</p>      

      <div>Yours sincerely <3</div>
      `;
  }
  return result;
};
module.exports = {
  sendEmail: sendEmail,
  sendAttachment: sendAttachment,
  sendCancelEmail: sendCancelEmail,
  sendCancelEmailForDoctor : sendCancelEmailForDoctor
};
