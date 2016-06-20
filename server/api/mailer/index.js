'use strict';

var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://m.nardova%40gmail.com:dfvgbh1984@smtp.gmail.com');

// setup e-mail data with unicode symbols
var mailOptions = {
  from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
  to: 'maria.nardova@ontarget-group.com', // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world', // plaintext body
  html: '<b>Hello world</b>' // html body
};

// send mail with defined transport object
export function sendMail() {
  console.log('we here');
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}
