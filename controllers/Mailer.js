const nodemailer = require("nodemailer");
//R2h8ncdF*JyS
// from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: "bar@example.com, baz@example.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>" // html body
var mailer =async function (from,to,subject,text,html,username,password){

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: username, // generated ethereal user
            pass: password// generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html // html body
    });
    console.log(new Date()+ " : "+ +"Email sent " + info.messageId);
};
module.exports = mailer;