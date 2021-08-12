const config = require("../config/app");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helper = require("../helpers/response");
const { Validator } = require("node-input-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const adminTable = require("../model/admin");
const { render } = require("ejs");
const { findByIdAndUpdate } = require("../model/admin");
const admin = require("../model/admin");
var empty = require("is-empty");
let ObjectId = mongoose.Types.ObjectId;
var axios = require("axios");
let saltRounds = 10;
var tmpMsg = "";

exports.login = async (req, res) => {
  // res.render('login',{msg:'Error'})
  try {
    const v = new Validator(req.body, {
      email: "required|email",
      password: "required",
    });
    const matched = await v.check();
    let email = v.errors.email ? v.errors.email.message : "";
    let password = v.errors.password ? v.errors.password.message : "";
    if (!matched) {
      let err = email + password;
      //  helper.validation_error(res,err)
      // res.render('login',{msg : "Validation Error"});
      tmpMsg = err;
      res.redirect("/auth/getLogin");
    } else {
      let admin = await adminTable.findOne({ email: req.body.email });
      // console.log(admin)
      if (admin) {
        bcrypt.compare(req.body.password, admin.password, (err, user) => {
          if (user == true) {
            var adminData = {
              adminID: admin._id,
              name: admin.name,
              email: admin.email,
            };
            req.session.admin = adminData;

            res.redirect("/dashboard");
          } else {
            //    helper.login_failed(res,"password not matched")
            //    res.render('login',{msg:"password not matched"});
            tmpMsg = "Password Not Matched";
            res.redirect("/auth/getLogin");
          }
        });
      } else {
        // helper.login_failed(res," this email not added")
        // res.render('login',{msg:"email not matched"});
        tmpMsg = "Email Not Matched";
        res.redirect("/auth/getLogin");
      }
    }
  } catch (err) {
    console.log(err);
    // helper.went_wrong(res,err)
    // res.render('login',{msg:err.message});
    tmpMsg = err.message;
    res.redirect("/auth/getLogin");
  }
};
exports.getLogin = async (req, res) => {
  // res.render('login',{msg:" "})
  res.render("login", { msg: tmpMsg, adminData: req.session.admin });
  tmpMsg = "";
};
exports.getEditProfile = async (req, res) => {
  //   res.render('editProfile',{msg:" "})
  res.render("editProfile", { msg: tmpMsg, adminData: req.session.admin });
  tmpMsg = "";
};
exports.editProfile = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      name: "required",
      email: "required",
    });
    const matched = await v.check();
    let name = v.errors.name ? v.errors.name.message : "";
    let email = v.errors.email ? v.errors.email.message : "";

    if (!matched) {
      let err = name + " " + email;
      //  helper.validation_error(res,err)
      tmpMsg = err;
      res.redirect("/auth/getEditProfile");
    } else {
      var arr = {};
      const its = ["name", "email"];
      for (const iterator of its) {
        //iterating object 'its'
        console.log(iterator);
        if (req.body[iterator]) {
          arr[iterator] = req.body[iterator];
        }
      }
      console.log(arr);

      let update = await adminTable.findByIdAndUpdate(
        { _id: req.session.admin.adminID },
        {
          $set: arr,
        }
      );
      if (update) {
        req.session.admin.name = req.body.name;
        req.session.admin.email = req.body.email;

        tmpMsg = "Successfully Updated";
        res.redirect("/auth/getEditProfile");
      } else {
        tmpMsg = "Error";
        res.redirect("/auth/getEditProfile");
      }
    }
  } catch {
    tmpMsg = "Error";
    res.redirect("/auth/getEditProfile");
  }
};
exports.getUpdatePassword = async (req, res) => {
  res.render("updatePassword", { msg: tmpMsg, adminData: req.session.admin });
  tmpMsg = "";
};

exports.updatePassword = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      oldPassword: "required",
      newPassword: "required",
      confirmNewPassword: "required",
    });
    const matched = await v.check();
    let oldPassword = v.errors.oldPassword ? v.errors.oldPassword.message : "";
    let newPassword = v.errors.newPassword ? v.errors.newPassword.message : "";

    let confirmNewPassword = v.errors.confirmNewPassword
      ? v.errors.confirmNewPassword.message
      : "";
    if (!matched) {
      let err = oldPassword + " " + newPassword + " " + confirmNewPassword;
      //  helper.validation_error(res,err)
      tmpMsg = err;
      res.redirect("/auth/getUpdatePassword");
    } else {
      var patten = /\s/g;

      var isSpace = patten.test(req.body.newPassword);

      if (isSpace) {
        tmpMsg =
          "Space Not Allowed! Please ReSet Your Password Without Space..";
        res.redirect("/auth/getUpdatePassword");
      }
      //  console.log("chk space",isSpace)// true or false
      else {
        let admin = await adminTable.findOne({
          email: req.session.admin.email,
        });
        // console.log(admin)
        if (admin) {
          bcrypt.compare(
            req.body.oldPassword,
            admin.password,
            async (err, user) => {
              if (user == true) {
                // if(empty((req.body.newPassword).trim()) ){
                //     tmpMsg = "you Cannot use Space in your Password!"
                //     res.redirect('/auth/getUpdatePassword');
                // }
                // else{
                if (req.body.newPassword == req.body.confirmNewPassword) {
                  let update = await adminTable.findByIdAndUpdate(
                    { _id: req.session.admin.adminID },
                    {
                      $set: {
                        password: bcrypt.hashSync(
                          req.body.newPassword,
                          saltRounds
                        ),
                      },
                    }
                  );
                  if (update) {
                    console.log("updated successfully");
                    tmpMsg = "Successfully Changed Password";
                    res.redirect("/auth/getUpdatePassword");
                  } else {
                    tmpMsg = "Server Error";
                    res.redirect("/auth/getUpdatePassword");
                  }
                } else {
                  tmpMsg = "Confirm Password Not Matched";
                  res.redirect("/auth/getUpdatePassword");
                }
              } else {
                tmpMsg = "Password Not Matched";
                res.redirect("/auth/getUpdatePassword");
              }
            }
          );
        } else {
          tmpMsg = "Admin Not Found";
          res.redirect("/auth/logout");
        }
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Error";
    res.redirect("/auth/getUpdatePassword");
  }
};

exports.getForgotPassword = async (req, res) => {
  res.render("forgotPassword", { msg: tmpMsg, adminData: req.session.admin });
  tmpMsg = "";
};

// exports.sendPasswordResetEmail = async (req, res, next) => {
//   try {
//     const v = new Validator(req.body, {
//       email: "required",
//     });
//     const matched = await v.check();
//     let email = v.errors.email ? v.errors.email.message : "";
//     if (!matched) {
//       let err = email;
//       tmpMsg = err;
//       res.redirect("/auth/getForgotPassword");
//     } else {
//       let payload = { emailId: req.body.email };

//       let response = await axios.post(
//         "http://18.168.167.20:4000/auth/sendAdminPasswordResetEmail",
//         payload
//       );
//       if (response.status == 200) {
//         tmpMsg = "We have shared a password reset link to your email!";
//         res.redirect("/auth/getForgotPassword");
//       } else {
//         tmpMsg = "Something Went Wrong. Please Try again later!";
//         res.redirect("/auth/getForgotPassword");
//       }
//     }
//   } catch (e) {
//     console.log("error during sending mail",e)
//     tmpMsg = "Something went Wrong. Please Try again later!!";
//     res.redirect("/auth/getForgotPassword");
//   }
// };


exports.sendPasswordResetEmail = async(req,res,next)=>{
  try{
      const v = new Validator(req.body,{
          email:'required'
      })
      const matched = await v.check();
      let email = v.errors.email?v.errors.email.message:''
 if(!matched){
     let err = email
         tmpMsg = err
          res.redirect('/auth/getForgotPassword')
   }
      else{
    adminTable.findOne({'email':req.body.email},(err,found)=>{
      if(err){
          
          tmpMsg ="Problem in fetching the user"
          res.redirect('/auth/getForgotPassword')
      }
    if(found){
                      let token = jwt.sign({
                          _id : found._id,
                          email  : found.email
                           },config.LOG_SECRET_KEY,{
                              audience: 'SqTosdsdKeNpRoJeCt',
                              expiresIn: 900
                          } );
                      // Html email body
                      let html = `<p>Please find your password reset link below.</p><a href='http://18.168.167.20:4000/auth/verifyToken/${token}'>Click here</a><br>Please Do not Share this URL with anyone.<br>Note:- Reset Link will expire in 10 Minute.`;
                      // Send confirmation email
                            console.log("check token"+token)
                      mailer.send(
                              config.SENDER_EMAIL, 
                          req.body.email,
                          "Find Your password reset link here",
                          html
                      ).then(success=>{                      
                           tmpMsg = "We have shared a password reset link to your email!"
                           res.redirect('/auth/getForgotPassword')
                      }).catch(error=>{
                            console.log("to see"+error)
                          tmpMsg = "Sorry, Some Problem Occurred ,Please try again"
                          res.redirect('/auth/getForgotPassword')
                      });
         
  }else
  {
      tmpMsg="Please Enter valid Email!"
      res.redirect('/auth/getForgotPassword')
  }
  })
}
}
  catch(e){

      tmpMsg="Something went Wrong!"
      res.redirect('/auth/getForgotPassword')

     }
}

exports.verifyToken = async (req, res) => {
  try {
    jwt.verify(
      req.params.token,
      config.LOG_SECRET_KEY,
      { audience: "SqTosdsdKeNpRoJeCt", expiresIn: 900 },
      function (err, tokenData) {
        if (err) {
          res.end("This is not a authorized URL.");
        }
        if (tokenData) {
          adminTable.findOne({ _id: ObjectId(tokenData._id) }, (err, found) => {
            if (err) {
              res.end("Some Error Occured. Please Try Again");
            }
            if (found) {
              req.session.tmp_id = found._id;
              tmpMsg = "";
              res.redirect("/auth/getResetPassword");
            } else {
              res.end("This is not a authorized URL");
            }
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
    tmpMsg = "Something went Wrong!";
    res.redirect("/auth/getForgotPassword");
  }
};

exports.getResetPassword = async (req, res) => {
  res.render("resetPassword", { msg: tmpMsg, adminData: req.session.admin });
  tmpMsg = "";
};

exports.resetPassword = async (req, res, next) => {
  try {
    const v = new Validator(req.body, {
      password: "required",
      confirmPassword: "required",
    });
    const matched = await v.check();
    let password = v.errors.password ? v.errors.password.message : "";
    let confirmPassword = v.errors.confirmPassword
      ? v.errors.confirmPassword.message
      : "";
    if (!matched) {
      let err = password + confirmPassword;
      tmpMsg = err;
      res.redirect("/auth/getResetPassword");
    } else {
      if (req.body.password !== req.body.confirmPassword) {
        tmpMsg = "New Password And Confirm Password should be same";
        res.redirect("/auth/getResetPassword");
      } else {
        let bcryptPassword = bcrypt.hashSync(req.body.password, saltRounds);
        var updated = await adminTable.findByIdAndUpdate(
          { _id: ObjectId(req.session.tmp_id) },
          { $set: { password: bcryptPassword } }
        );

        if (updated) {
          req.session.destroy();
          tmpMsg =
            "Password Changed Successfully, Please Close the window and login";
          res.redirect("/auth/getResetPassword");
        } else {
          tmpMsg =
            "This password reset link is expired, Please generate new password reset email.";
          res.redirect("/auth/getResetPassword");
        }
      }
    }
  } catch (e) {
    tmpMsg = "Something went Wrong!";
    res.redirect("/auth/getResetPassword");
  }
};

exports.logout = async (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/auth/getLogin"); //Inside a callback… bulletproof!
  });
};
