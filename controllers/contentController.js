const config = require("../config/app");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helper = require("../helpers/response");
const { Validator } = require("node-input-validator");
const bcrypt = require("bcrypt");

const contentTable = require("../model/content");
const utility = require("../helpers/utility");
const { render } = require("ejs");
let saltRounds = 10;
let ObjectId = mongoose.Types.ObjectId;
var empty = require("is-empty");
var tmpMsg = "";

exports.getPrivacyPolicyContent = async (req, res) => {
  try {
    let contents = await contentTable.findOne({ type: "1" });
    if (contents) {
      res.render("updateContent", {
        msg: tmpMsg,
        data: contents,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    } else {
      res.render("privacyPolicyContent", {
        msg: tmpMsg,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    }
  } catch (err) {
    tmpMsg = err;
    res.redirect("/content/getPrivacyPolicyContent");
  }
};
exports.getTermsContent = async (req, res) => {
  try {
    let contents = await contentTable.findOne({ type: "2" });
    if (contents) {
      res.render("updateContent", {
        msg: tmpMsg,
        data: contents,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    } else {
      res.render("termsContent", { msg: tmpMsg, adminData: req.session.admin });
      tmpMsg = "";
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "There is a Problem in displaying Add Content Page!";
    res.redirect("/content/getTermsContent");
  }
};
exports.getPaymentRefundContent = async (req, res) => {
  try {
    let contents = await contentTable.findOne({ type: "3" });
    if (contents) {
      res.render("updateContent", {
        msg: tmpMsg,
        data: contents,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    } else {
      res.render("paymentRefundContent", {
        msg: tmpMsg,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "There is a Problem in displaying Add Content Page!";
    res.redirect("/content/getPaymentRefundContent");
  }
};
exports.addPrivacyPolicy = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      tittle: "required",
      content: "required",
    });
    const matched = await v.check();
    let tittle = v.errors.tittle ? v.errors.tittle.message : "";
    let content = v.errors.content ? v.errors.content.message : "";
    if (!matched) {
      let err = tittle + content;
      tmpMsg = err;
      res.redirect("/content/getPrivacyPolicyContent");
    } else {
      contentTable
        .create({
          tittle: req.body.tittle,
          content: req.body.content,
          type: req.params.type,
        })
        .then((contnt) => {
          console.log("added promo code" + contnt);
          tmpMsg = "Content Added Successfully";
          res.redirect("/content/getPrivacyPolicyContent");
        })
        .catch((err) => {
          tmpMsg = err;
          res.redirect("/content/getPrivacyPolicyContent");
        });
    }
  } catch (err) {
    tmpMsg = err;
    res.redirect("/content/getPrivacyPolicyContent");
  }
};

exports.addTermsCondition = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      tittle: "required",
      content: "required",
    });
    const matched = await v.check();
    let tittle = v.errors.tittle ? v.errors.tittle.message : "";
    let content = v.errors.content ? v.errors.content.message : "";
    if (!matched) {
      let err = tittle + content;
      tmpMsg = err;
      res.redirect("/content/getTermsContent");
    } else {
      contentTable
        .create({
          tittle: req.body.tittle,
          content: req.body.content,
          type: req.params.type,
        })
        .then((contnt) => {
          console.log("added promo code" + contnt);
          tmpMsg = "Content Added Successfully";
          res.redirect("/content/getTermsContent");
        })
        .catch((err) => {
          tmpMsg = err;
          res.redirect("/content/getTermsContent");
        });
    }
  } catch (err) {
    tmpMsg = err;
    res.redirect("/content/getTermsContent");
  }
};

exports.addPaymentRefund = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      tittle: "required",
      content: "required",
    });
    const matched = await v.check();
    let tittle = v.errors.tittle ? v.errors.tittle.message : "";
    let content = v.errors.content ? v.errors.content.message : "";
    if (!matched) {
      let err = tittle + content;
      tmpMsg = err;
      res.redirect("/content/getPaymentRefundContent");
    } else {
      contentTable
        .create({
          tittle: req.body.tittle,
          content: req.body.content,
          type: req.params.type,
        })
        .then((contnt) => {
          console.log("added promo code" + contnt);
          tmpMsg = "Content Added Successfully";
          res.redirect("/content/getPaymentRefundContent");
        })
        .catch((err) => {
          tmpMsg = err;
          res.redirect("/content/getPaymentRefundContent");
        });
    }
  } catch (err) {
    tmpMsg = err;
    res.redirect("/content/getPaymentRefundContent");
  }
};

exports.updateContent = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      tittle: "required",
      content: "required",
    });
    const matched = await v.check();
    let tittle = v.errors.tittle ? v.errors.tittle.message : "";
    let content = v.errors.content ? v.errors.content.message : "";

    if (!matched) {
      let err = tittle + content;
      tmpMsg = err;
      res.redirect("/content/getPrivacyPolicyContent");
    } else {
      var dataToUpdate = {
        tittle: req.body.tittle,
        content: req.body.content,
        updatedAt: Date.now(),
      };
      contentTable.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(req.params.contentID) },
        { $set: dataToUpdate },
        (updateErr, updated) => {
          if (updateErr) {
            console.log("to solve", updateErr);
            tmpMsg = "Some Problem Occured during updating Content";
            res.redirect("/content/getPrivacyPolicyContent");
          }
          if (updated) {
            if (req.params.types == "1") {
              tmpMsg = "Content Updated Successfully";
              res.redirect("/content/getPrivacyPolicyContent");
            }
            if (req.params.types == "2") {
              tmpMsg = "Content Updated Successfully";
              res.redirect("/content/getTermsContent");
            }
            if (req.params.types == "3") {
              tmpMsg = "Content Updated Successfully";
              res.redirect("/content/getPaymentRefundContent");
            }
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Updating Content";
    res.redirect("/content/getPrivacyPolicyContent");
  }
};
