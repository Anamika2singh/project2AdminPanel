
const config = require('../config/app')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(config.SENDGRID_API_KEY)
const fs = require('fs');
const Handlebars = require('handlebars');

exports.send = function (from, to, subject, html)
{
      return new Promise ( function ( resolve , reject){       
        const msg = {
            to: to, // Change to your recipient
            from: from, // Change to your verified sender
            subject: subject,
            // text: html,
            html: html,
          }
          sgMail
            .send(msg)
            .then(() => {
              resolve('Email sent')
            })
            .catch((error) => {
              reject(error)
            })   
    });
};

exports.sendActionUpdate = (email, message, userName)=> {
  return new Promise ( function ( resolve , reject){
            // send mail for reset password
            fs.readFile("./emailTemplate/template.html", function (
                err,
                sendActionUpdate
            ) {
                if (err) {
                    reject(err);
                }

                var variableData = {
                    email: email,
                    message: message,
                    userName: userName
                };
                var templateHtml = Handlebars.compile(
                  sendActionUpdate.toString()
                );
                var bodyHtml = templateHtml(variableData);
                // send mail with defined transport object
                 const msg = {
                    to: email, // Change to your recipient
                    from: config.SENDER_EMAIL, // Change to your verified sender
                    subject: 'VALET-IT,Action Update',
                    // text: html,
                    html: bodyHtml,
                  }
                  sgMail
                    .send(msg)
                    .then(() => {
                      resolve('Email sent')
                    })
                    .catch((error) => {
                      reject(error)
                    })
            });
          })
    }
