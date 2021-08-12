const config = require("../config/app");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helper = require("../helpers/response");
const { Validator } = require("node-input-validator");
const bcrypt = require("bcrypt");
const carTable = require("../model/car");
const { render } = require("ejs");
const { findByIdAndUpdate } = require("../model/admin");
let saltRounds = 10;
const utility = require("../helpers/utility");
var empty = require("is-empty");
var tmpMsg = "";
let ObjectId = mongoose.Types.ObjectId;

exports.getCar = async (req, res) => {
  var search = "";
  var sort = { createdAt: -1 };
  if (req.query.sort == "OtoN") {
    sort = { createdAt: 1 };
  }
  if (req.query.search) {
    search = req.query.search;
  }

  let found = await carTable
    .find({ name: { $regex: search, $options: "i" } })
    .sort(sort);
  if (found) {
    res.render("manageCar", {
      msg: tmpMsg,
      data: found,
      adminData: req.session.admin,
    });
    tmpMsg = "";
  } else {
    res.render("manageCar", {
      msg: "There is a Problem in displaying Cars.",
      data: [],
      adminData: req.session.admin,
    });
    tmpMsg = "";
  }
};

exports.addCar = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      carName: "required",
    });
    const matched = await v.check();
    let carName = v.errors.carName ? v.errors.carName.message : "";
    if (!matched) {
      let err = carName;
      //        helper.validation_error(res,err)
      tmpMsg = err;
      res.redirect("/car/getCar");
    } else {
      if (!empty(req.file)) {
        //upload new profile image to s3 bucket
        utility
          .uploadFile(
            req.file.destination,
            req.file.filename,
            req.file.mimetype,
            config.S3_BUCKET_NAME + "car"
          )
          .then(async (uploaded) => {
            if (uploaded) {
              carTable
                .create({
                  name: req.body.carName,
                  image: req.file.filename,
                })
                .then((car) => {
                  console.log(car);
                  tmpMsg = "Car Added Successfully";
                  res.redirect("/car/getCar");
                })
                .catch((err) => {
                  console.log(err);
                  tmpMsg =
                    "Some problem Occured during Inserting Car Details. Please Try Again";
                  res.redirect("/car/getCar");
                });
            }
          })
          .catch((upload_err) => {
            console.log(upload_err);
            tmpMsg =
              "Some problem occured during uploading files on our server";
            res.redirect("/car/getCar");
          });
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some problem Occured during Inserting. Please Try Again";
    res.redirect("/car/getCar");
  }
};

exports.updateCar = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      carName: "required",
    });
    const matched = await v.check();
    let carName = v.errors.carName ? v.errors.carName.message : "";
    if (!matched) {
      let err = carName;
      tmpMsg = err;
      res.redirect("/car/getCar");
    } else {
      var dataToUpdate = {
        name: req.body.carName,
        updatedAt: Date.now(),
      };
      if (!empty(req.file)) {
        dataToUpdate.image = req.file.filename;
        //upload new profile image to s3 bucket
        utility
          .uploadFile(
            req.file.destination,
            req.file.filename,
            req.file.mimetype,
            config.S3_BUCKET_NAME + "car"
          )
          .then(async (uploaded) => {
            if (uploaded) {
              carTable.findByIdAndUpdate(
                { _id: req.params.carID },
                { $set: dataToUpdate },
                (updateErr, updated) => {
                  if (updateErr) {
                    tmpMsg =
                      "Some Problem Occured during updating car Details!";
                    res.redirect("/car/getCar");
                  }
                  if (updated) {
                    utility.deleteS3File(
                      req.params.image,
                      config.S3_BUCKET_NAME + "car"
                    );
                    tmpMsg = "Car Details Updated Successfully";
                    res.redirect("/car/getCar");
                  }
                }
              );
            }
          })
          .catch((upload_err) => {
            tmpMsg =
              "Some problem occured during uploading files on our server";
            res.redirect("/car/getCar");
          });
      } else {
        carTable.findByIdAndUpdate(
          { _id: req.params.carID },
          { $set: dataToUpdate },
          (updateErr, updated) => {
            if (updateErr) {
              tmpMsg = "Some Problem Occured during updating Car Details";
              res.redirect("/car/getCar");
            }
            if (updated) {
              tmpMsg = "Car Details Updated Successfully";
              res.redirect("/car/getCar");
            }
          }
        );
      }
    }
  } catch (err) {
    tmpMsg = "Some Problem Occured during adding Car Details";
    res.redirect("/car/getCar");
  }
};
exports.setAction = async (req, res) => {
  try {
    if (req.params.action == 1) {
      let update = await carTable.findByIdAndUpdate(
        { _id: req.params.carID },
        {
          $set: {
            status: 0, // 0 = inactive 1= active
          },
        }
      );
      if (update) {
        // tmpMsg = 'Car Deactivated Successfully!';
        res.redirect("/car/getCar");
      } else {
        tmpMsg = "Some Problem Occured during Car Deactivated!";
        res.redirect("/car/getCar");
      }
    } else if (req.params.action == 0) {
      let update = await carTable.findByIdAndUpdate(
        { _id: req.params.carID },
        {
          $set: {
            status: 1, // 0 = inactive 1= active
          },
        }
      );
      if (update) {
        // tmpMsg = 'car Activated Successfully!';
        res.redirect("/car/getCar");
      } else {
        tmpMsg = "Some Problem Occured during Car Activation!";
        res.redirect("/car/getCar");
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Updating Permission!";
    res.redirect("/car/getCar");
  }
};
exports.deleteCar = async (req, res) => {
  try {
    if (!empty(req.params.carID)) {
      let found = await carTable.findOne({ _id: req.params.carID });
      if (found) {
        var picsToDelete = found.image;
        let update = await carTable.deleteOne({
          _id: ObjectId(req.params.carID),
        });
        if (update.n) {
          tmpMsg = "Car Deleted SuccessFully";
          res.redirect("/car/getCar");
          if (!empty(picsToDelete)) {
            utility.deleteS3File(picsToDelete, config.S3_BUCKET_NAME + "car");
          }
        } else {
          tmpMsg = "Not Found it Might be Already Deleted!";
          res.redirect("/car/getCar");
        }
      }
    } else {
      tmpMsg = "This Item Not Found";
      res.redirect("/car/getCar");
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Deleting Selling Item!";
    res.redirect("/car/getCar");
  }
};
