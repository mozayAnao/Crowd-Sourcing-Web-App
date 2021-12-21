var nodemailer = require('nodemailer');

module.exports = function mailer(receipient, subject, html) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: PROCESS.ENV.email,
          pass: PROCESS.ENV.password
        }
      });
      
      var mailOptions = {
        from: 'MaximNyansaFundAfric',
        to: receipient,
        subject: subject,
        html: html
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

