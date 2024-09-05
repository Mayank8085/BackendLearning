const nodemailer = require('nodemailer');

const mailHelper = async (option)=>{
    const transporter = nodemailer.createTransport({
        // host: 'smtp.gmail.com',
        // port: 465,
        // secure: true,
        // auth: {
        //     user: '' ,
        //     pass: ''
        // }
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        // secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const Message = {
        from: 'mayanksahu1806@gmail.com',
        to: option.email,
        subject: option.subject,
        text: option.message
    };

    transporter.sendMail(Message, (err, info) => {
        if(err){
            console.log(err);
        }else{
            console.log('Email sent: ' + info.response);
        }
    }
    );
}


module.exports = mailHelper;