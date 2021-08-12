const config = require("../config/app");
const express = require("express");
const app = express();
const moment = require("moment");
const mongoose = require("mongoose");
const helper = require("../helpers/response");
const { Validator } = require("node-input-validator");
const bcrypt = require("bcrypt");
const promoTable = require("../model/promoCode");
const utility = require("../helpers/utility");
const { render } = require("ejs");
let saltRounds = 10;
let ObjectId = mongoose.Types.ObjectId;
var empty = require("is-empty");
var tmpMsg = "";

exports.getPromoCode = async (req, res) => {
  try {
    var sort = { createdAt: -1 };
    var search = "";
    var filter = {};
    if (req.query.sort == "OtoN") {
      sort = { createdAt: 1 };
    }
    if (req.query.search) {
      search = req.query.search;
    }
    if (req.query.filter) {
      //0 = flat , 1= percentage discount
      filter.type = parseInt(req.query.filter);
    }

    let promos = await promoTable
      .find({ $and: [{ name: { $regex: search, $options: "i" } }, filter] })
      .sort(sort);
    if (promos) {
      res.render("managePromoCode", {
        msg: tmpMsg,
        data: promos,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    } else {
      res.render("managePromoCode", {
        msg: "There is a Problem in displaying Promo Codes.",
        data: [],
        adminData: req.session.admin,
      });
      tmpMsg = "";
    }
  } catch (e) {
    console.log("problem" + e);
    res.render("managePromoCode", {
      msg: "There is a Problem in displaying Promo Codes.",
      data: [],
      adminData: req.session.admin,
    });
    tmpMsg = "";
  }
};
exports.getAddPromoCode = (req, res) => {
  try {
    res.render("addPromoCode", { msg: tmpMsg, adminData: req.session.admin });
    tmpMsg = "";
  } catch (err) {
    console.log(err);
    tmpMsg = "There is a Problem in displaying Add promo Page!";
    res.redirect("/promo/getPromoCode");
  }
};
exports.addPromoCode = async (req, res) => {
  try { 
    const v = new Validator(req.body, {
      name: "required",
      description: "required",
      upTo: "required",
      type: "required",
      updatedValidFrom: "required",
      updatedValidTill: "required",
    });
    const matched = await v.check();
    let name = v.errors.name ? v.errors.name.message : "";
    let description = v.errors.description ? v.errors.description.message : "";
    let upTo = v.errors.upTo ? v.errors.upTo.message : "";
    let type = v.errors.type ? v.errors.type.message : "";
    let updatedValidFrom = v.errors.updatedValidFrom ? v.errors.updatedValidFrom.message : "";
    let updatedValidTill = v.errors.updatedValidTill ? v.errors.updatedValidTill.message : "";

    if (!matched) {
      let err = name + description + upTo + type + updatedValidFrom + updatedValidTill;
      tmpMsg = err;
      res.redirect("/promo/getAddPromoCode");
    } else {
     
      let dublicate = await promoTable.findOne({ name: req.body.name });
      if (dublicate) {
        tmpMsg = "Promo code with this name Already Exist!";
        res.redirect("/promo/getAddPromoCode");
      } else {
        promoTable
          .create({
            name: req.body.name,
            description: req.body.description,
            validFrom:req.body.updatedValidFrom,
            validTill:req.body.updatedValidTill,
            type: req.body.type,
            discount: req.body.type == 1 ? parseFloat(req.body.discount) : 1,
            upTo: req.body.upTo,
            minimumCartValue: req.body.minimumCartValue,
          })
          .then((promo) => {
            console.log("added promo code" + promo);
            tmpMsg = "Promo Code Added Successfully";
            res.redirect("/promo/getPromoCode");
          })
          .catch((err) => {
            tmpMsg = err;
            res.redirect("/promo/getAddPromoCode");
          });
      }
    }
  } catch (err) {
    tmpMsg = err;
    res.redirect("/promo/getAddPromoCode");
  }
};

exports.getUpdatePromoCode = async (req, res) => {
  try {
    let promos = await promoTable.findOne({
      _id: ObjectId(req.params.promoID),
    });
    
    if (promos) {
     
      res.render("updatePromoCode", {
        msg: tmpMsg, 
        data: promos,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    } else {
      // console.log("no sports found")
      res.render("updatePromoCode", {
        msg: "There is a Problem in displaying Promo Code.",
        data: [],
        adminData: req.session.admin,
      });
      tmpMsg = "";
    }
  } catch (err) {
    tmpMsg = err;
    res.redirect("/promo/getUpdatePromoCode/" + req.params.promoID);
  }
};

exports.updatePromoCode = async (req, res) => {
  try { 
    const v = new Validator(req.body, {
      name: "required",
      description: "required",
      upTo: "required",
      type: "required",
      updatedValidFrom: "required",
      updatedValidTill: "required",    
    });
    const matched = await v.check();
    let name = v.errors.name ? v.errors.name.message : "";
    let description = v.errors.description ? v.errors.description.message : "";
    let upTo = v.errors.upTo ? v.errors.upTo.message : "";
    let type = v.errors.type ? v.errors.type.message : "";
    let updatedValidFrom = v.errors.updatedValidFrom ? v.errors.updatedValidFrom.message : "";
    let updatedValidTill = v.errors.updatedValidTill ? v.errors.updatedValidTill.message : "";
    if (!matched) {
      let err = name + description + upTo + type + updatedValidFrom + updatedValidTill;
      tmpMsg = err;
      console.log(err);
      res.redirect("/promo/getUpdatePromoCode/" + req.params.promoID);
    } else {
      var dataToUpdate = {
        name: req.body.name,
        description: req.body.description,
        validFrom:req.body.updatedValidFrom,
        validTill:req.body.updatedValidTill,
        type: req.body.type,
        discount: req.body.type == 1 ? parseFloat(req.body.discount) : 1,
        upTo: req.body.upTo,
        minimumCartValue: req.body.minimumCartValue,
        updatedAt: Date.now(),
      };
      promoTable.findByIdAndUpdate(
        { _id: req.params.promoID },
        { $set: dataToUpdate },
        (updateErr, updated) => {
          if (updateErr) {
            console.log("problem",updateErr)
            tmpMsg = "Some Problem Occured during updating promo Code";
            console.log(tmpMsg);
            res.redirect("/promo/getUpdatePromoCode/" + req.params.promoID);
          }
          if (updated) {
            console.log("updated sucessfully",updated);
            tmpMsg = "Promo Code Updated Successfully";
            res.redirect("/promo/getPromoCode");
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Updating Promo Code";
    res.redirect("/promo/getUpdatePromoCode/" + req.params.promoID);
  }
};
exports.deletePromoCode = (req, res) => {
  try {
    if (!empty(req.params.promoID)) {
      promoTable.deleteOne({ _id: req.params.promoID }, (error, deleted) => {
        if (error) {
          tmpMsg = "Some Problem Occured during Deleting promo Code";
          res.redirect("/promo/getPromoCode");
        }
        if (deleted) {
          tmpMsg = "Promo Code Deleted SuccessFully";
          res.redirect("/promo/getPromoCode");
        }
      });
    } else {
      tmpMsg = "This promo Code  Not Found";
      res.redirect("/promo/getPromoCode");
    }
  } catch (err) {
    tmpMsg = "Some Problem Occured during Deleting Event";
    res.redirect("/promo/getPromoCode");
  }
};
exports.setAction = async (req, res) => {
  try {
    if (req.params.action == 1) {
      let update = await promoTable.findByIdAndUpdate(
        { _id: req.params.promoID },
        {
          $set: {
            status: 0, // 0 = inactivate promo Code 1= activate Promo Code
          },
        }
      );
      if (update) {
        tmpMsg = "Promo Code Deactivated Successfully!";
        res.redirect("/promo/getPromoCode");
      } else {
        tmpMsg = "Some Problem Occured during Promo Code Deactivated!";
        res.redirect("/promo/getPromoCode");
      }
    } else if (req.params.action == 0) {
      let update = await promoTable.findByIdAndUpdate(
        { _id: req.params.promoID },
        {
          $set: {
            status: 1, // 0 = inactivate promo Code 1= activate Promo Code
          },
        }
      );
      if (update) {
        tmpMsg = "Promo Code Activated Successfully!";
        res.redirect("/promo/getPromoCode");
      } else {
        tmpMsg = "Some Problem Occured during Promo Code Activation!";
        res.redirect("/promo/getPromoCode");
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Updating Permission!";
    res.redirect("/promo/getPromoCode");
  }
};
