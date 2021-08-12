const express = require("express");
const app = express();
var isSet = require("isset");
var empty = require("is-empty");
const { models } = require("mongoose");
const userTable = require("../model/user");
const providerTable = require("../model/provider");
const carTable = require("../model/car");
const promoTable = require("../model/promoCode");
const sellingItemTable = require("../model/sellingItem");
const orderTable = require("../model/order");
const admin = require("../model/admin");
const itemOrderTable = require("../model/sellingOrder");
const { Validator } = require("node-input-validator");
exports.homePage = (req, res) => {
  if (isSet(req.session.admin) && !empty(req.session.admin)) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/auth/getLogin");
  }
};
exports.dashboard = async (req, res) => {
  var data = {};
  let users = await userTable.countDocuments();
  if (users) {
    data.users = users;
  } else {
    data.users = 0;
  }
  let providers = await providerTable.countDocuments();
  if (providers) {
    data.providers = providers;
  } else {
    data.providers = 0;
  }
  let cars = await carTable.countDocuments();
  if (cars) {
    data.cars = cars;
  } else {
    data.cars = 0;
  }
  let promoCodes = await promoTable.countDocuments();
  if (promoCodes) {
    data.promoCodes = promoCodes;
  } else {
    data.promoCodes = 0;
  }
  let items = await sellingItemTable.countDocuments();
  if (items) {
    data.items = items;
  } else {
    data.items = 0;
  }
  let orders = await orderTable.countDocuments();
  if (orders) {
    data.orders = orders;
  } else {
    data.orders = 0;
  }
  // let deliveryFee = await admin.findOne();
  // if (deliveryFee) {
  //   data.deliveryFee = deliveryFee.sellingItemDeliveryFee;
  // } else {
  //   data.deliveryFee = "";
  // }
  let itemOrders = await itemOrderTable.countDocuments();
  if (itemOrders) {
    data.itemOrders = itemOrders;
  } else {
    data.itemOrders = 0;
  }
  let newItemOrders = await itemOrderTable.countDocuments({'status':0})
  if (newItemOrders) {
    data.newItemOrders = newItemOrders;
  } else {
    data.newItemOrders = 0;
  }
  let newCarWashOrders = await orderTable.countDocuments({'status':0})
  if (newCarWashOrders) {
    data.newCarWashOrders = newCarWashOrders;
  } else {
    data.newCarWashOrders = 0;
  }
 let newProviders = await providerTable.countDocuments({ $and: [{'providerAccountSetup': {$gt:0} }, {'isVerified':2}] })
 if(newProviders){
   data.newProviders = newProviders;  
 }
 else{
  data.newProviders = 0;
 }
 res.render("dashboard", { data: data, adminData: req.session.admin });
};

exports.updateDeliveryFee = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      deliveryFee: "required",
    });
    const matched = await v.check();
    let deliveryFee = v.errors.deliveryFee ? v.errors.deliveryFee.message : "";
    if (!matched) { 
      let err = deliveryFee;
      res.redirect("/deliveryFee");
    } else {
      let update = await admin.updateMany(
        {},
        { $set: { sellingItemDeliveryFee: req.body.deliveryFee } }
      );
      res.redirect("/deliveryFee");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/deliveryFee");
  }
};
exports.deliveryFee = async(req,res)=>{
  try{
    var data = {};
    let deliveryFee = await admin.findOne();
  if (deliveryFee) {
    data.deliveryFee = deliveryFee.sellingItemDeliveryFee;
  } else {
    data.deliveryFee = "";
  }
    res.render("manageDeliveryFee", { data: data, adminData: req.session.admin });
  }
  catch(err){
    console.log(err);
    res.redirect("/deliveryFee");
  }
}