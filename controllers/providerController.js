const express = require("express");
const app = express();
var isSet = require("isset");
var empty = require("is-empty");
const { models } = require("mongoose");
const providerTable = require("../model/provider");
const carTable = require("../model/car");
const utility = require("../helpers/utility");
const mailer = require('../helpers/mailer');
var tmpMsg = "";

exports.getManageProvider = async (req, res) => {
  try {
    data = [];
    res.render("manageProvider", {
      msg: tmpMsg,
      data: data,
      adminData: req.session.admin,
    });
    tmpMsg = "";
  } catch (e) {
    res.render("manageProvider", {
      msg: "User Not Found!",
      data: [],
      adminData: req.session.admin,
    });
    tmpMsg = "";
  }
};
exports.paginateOrders = async (req, res) => {
  try {
    //listing of registered Providers
    console.log(req.body);
    var sort = {};
    var search = "";

    var filterT = "";
    var filter1 = "";
    if (req.body.order[0]["dir"] == "desc") {
      sort = { createdAt: -1 };
    }
    if (req.body.order[0]["dir"] == "asc") {
      sort = { createdAt: 1 };
    }
    console.log("order", req.body.order[0]["dir"]);

    if (req.body.search.value) {
      search = req.body.search.value;
    }

    if (req.body.deliveryFilter == "0") {
      filterT = {
        $and: [
          { deliveryOption: { $all: ["0"] } },
          { deliveryOption: { $not: { $all: ["1"] } } },
        ],
      };
    } else if (req.body.deliveryFilter == "1") {
      filterT = {
        $and: [
          { deliveryOption: { $all: ["1"] } },
          { deliveryOption: { $not: { $all: ["0"] } } },
        ],
      };
    } else if (req.body.deliveryFilter == "2") {
      filterT = {
        $and: [
          { deliveryOption: { $in: ["0"] } },
          { deliveryOption: { $in: ["1"] } },
        ],
      };
    } else {
      filterT = {};
    }
    console.log("1st filter is :", filterT);
    if (req.body.serviceFilter == "0") {
      filter1 = {
        $and: [
          { serviceType: { $all: ["0"] } },
          { serviceType: { $not: { $all: ["1"] } } },
        ],
      };
    } else if (req.body.serviceFilter == "1") {
      filter1 = {
        $and: [
          { serviceType: { $all: ["1"] } },
          { serviceType: { $not: { $all: ["0"] } } },
        ],
      };
    } else if (req.body.serviceFilter == "2") {
      filter1 = {
        $and: [
          { serviceType: { $in: ["0"] } },
          { serviceType: { $in: ["1"] } },
        ],
      };
    } else {
      filter1 = {};
    }

    console.log("2nd filter is:", filter1);
    var start = 1;
    if (req.body.start) {
      start = parseInt(req.body.start);
    }
    var length = 1;
    if (req.body.length) {
      length = parseInt(req.body.length);
    }

    let recordsTotal = await providerTable.countDocuments({providerAccountSetup:{$gt:0}
    }); // total orders
    if (recordsTotal) {
      recordsTotal = recordsTotal;
      console.log("records total:",recordsTotal);
    } else {
      recordsTotal = 0;
    }
    let found = await providerTable
      .find(
        {
          $and: [
            {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { emailId: { $regex: search, $options: "i" } },

              ],
            }
            ,
            {providerAccountSetup:{$gt:0}
    },
            filterT,
            filter1,
          ],
        },
        {
          name: 1,
          emailId: 1,
          serviceType: 1,
          deliveryOption: 1,
          countryCode: 1,
          mobileNumber: 1,
          createdAt: 1,
          isVerified: 1,
          permissionForSell: 1,
        }
      )
      .sort(sort);
    // .limit(length).skip(start)

    var arr = [];
    var tmp = 0;
    // console.log(start, length);
    for (let k = start; k <= length + start - 1; k++) {
      // console.log("outer", k);
      if (k > found.length - 1) {
        // console.log("inner", k);
        break;
      }
      arr[tmp] = found[k];
      // console.log("tmp", tmp);
      tmp++;
    }
    var data = JSON.stringify({
      draw: req.body.draw,
      recordsFiltered: found.length,
      recordsTotal: recordsTotal,
      data: arr,
    });
    if (found) {
      res.send(data);
    } else {
      return res.json(
        {
          message: "not found",
          data: [],
        },
        404
      );
    }
  } catch (e) {
    console.log("error", e);
    return res.json(
      {
        message: e.message,
        data: [],
      },
      500
    );
  }
};
exports.approvalAction = async (req, res) => {
  try {
    let found = await providerTable.findOne({ _id: req.params.providerId });
    if (found) {
      let update = await providerTable.findByIdAndUpdate(
        { _id: found._id },
        {
          $set: {
            isVerified: req.params.type, //0 = not verified account 1 = verified account
          },
        }
      );
      if (update) {
        if (req.params.type == 1) {
          // tmpMsg = 'Successfully approved!';
           
          if(!empty(update.emailId)){
            // message email body
               let message = `Your Account is successfully Approved by Admin. Enjoy The VALET-IT services.`;
               // Send confirmation email
               mailer.sendActionUpdate(
                    update.emailId,
                    message,
                   update.name
               ).then(success=>{
                console.log("Account Approved Email Sent!")
               }).catch(error=>{
                 console.log(error)
               });
              }



          res.redirect("/provider/getViewProfile/" + req.params.providerId);
          if (update.pushNotification == 1) {
            if (update.deviceType == "android") {
              let data = {
                title: "VALET-IT",
                message:
                  "You are successfully verified by Admin. Enjoy The VALET-IT services.",
                deviceType: "android",
                notificationType: "verificationActionByAdmin",
                isVerified: "1",
              };
              let token = update.deviceToken;
              utility.sendFCMNotificationToAndroid(data, token);
            } else if (update.deviceType == "ios") {
              let data = {
                title: "VALET-IT",
                message:
                  "You are successfully verified by Admin. Enjoy The VALET-IT services.",
                deviceType: "ios",
                notificationType: "verificationActionByAdmin",
                isVerified: "1",
              };
              let notification = {
                title: "VALET-IT",
                body: "You are successfully verified by Admin. Enjoy The VALET-IT services.",
              };
              let token = update.deviceToken;
              utility.sendFCMNotificationToIOS(notification, data, token);
            }
          }
        } else if (req.params.type == 0) {
          // tmpMsg = 'Successfully rejected!';

          if(!empty(update.emailId)){
            // message email body
               let message = `Your Account Verification request is rejected. Kindly contact to admin.`;
               // Send confirmation email
               mailer.sendActionUpdate(
                    update.emailId,
                    message,
                   update.name
               ).then(success=>{
                console.log("verification rejected Email Sent!")
               }).catch(error=>{
                 console.log(error)
               });
              }
          res.redirect("/provider/getViewProfile/" + req.params.providerId);
          if (update.pushNotification == 1) {
            if (update.deviceType == "android") {
              let data = {
                title: "VALET-IT",
                message:
                  "Your  verification request is rejected. Kindly contact to admin.",
                deviceType: "android",
                notificationType: "verificationActionByAdmin",
                isVerified: "0",
              };
              let token = update.deviceToken;
              utility.sendFCMNotificationToAndroid(data, token);
            } else if (update.deviceType == "ios") {
              let data = {
                title: "VALET-IT",
                message:
                  "Your  verification request is rejected. Kindly contact to admin.",
                deviceType: "ios",
                notificationType: "verificationActionByAdmin",
                isVerified: "0",
              };
              let notification = {
                title: "VALET-IT",
                body: "Your  verification request is rejected. Kindly contact to admin.",
              };
              let token = update.deviceToken;
              utility.sendFCMNotificationToIOS(notification, data, token);
            }
          }
        }
      } else {
        tmpMsg = "Some Problem Occured during updating Approval Request!";
        res.redirect("/provider/getViewProfile/" + req.params.providerId);
      }
    } else {
      tmpMsg = "User Not Found!";
      res.redirect("/provider/getViewProfile/" + req.params.providerId);
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during updating Approval Request!";
    res.redirect("/provider/getViewProfile/" + req.params.providerId);
  }
};
exports.getViewProfile = async (req, res) => {
  let found = await providerTable.findOne({ _id: req.params.providerId });
  if (found) {
    console.log("provider details here :", found);
    let getCars = await carTable.find();
    if (getCars) {
      console.log(found, getCars);

      res.render("viewProfile", {
        msg: tmpMsg,
        userData: found,
        cars: getCars,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    } else {
      res.render("viewProfile", {
        msg: "Cars Not Found!",
        userData: found,
        cars: [],
        adminData: req.session.admin,
      });
      tmpMsg = "";
    }
  } else {
    res.render("viewProfile", {
      msg: "User Not Found!",
      userData: [],
      cars: [],
      adminData: req.session.admin,
    });
    tmpMsg = "";
  }
};

exports.sellPermission = async (req, res) => {
  try {
    if (req.params.permissionForSell == 1) {
      let update = await providerTable.findByIdAndUpdate(
        { _id: req.params.ProviderID },
        {
          $set: {
            permissionForSell: 0, //1 = allowed  0 = not allowed
          },
        }
      );
      if (update) {
        //   tmpMsg = 'Permission Denied For Selling Item!';
        res.redirect("/provider/getManageProvider");
      } else {
        tmpMsg = "Some Problem Occured during Denying Permission!";
        res.redirect("/provider/getManageProvider");
      }
    } else if (req.params.permissionForSell == 0) {
      let update = await providerTable.findByIdAndUpdate(
        { _id: req.params.ProviderID },
        {
          $set: {
            permissionForSell: 1, //1 = allowed  0 = not allowed
          },
        }
      );
      if (update) {
        // tmpMsg = 'Selling Permission Approved!';
        res.redirect("/provider/getManageProvider");
      } else {
        tmpMsg = "Some Problem Occured during Allowing Permission!";
        res.redirect("/provider/getManageProvider");
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Updating Permission!";
    res.redirect("/provider/getManageProvider");
  }
};
