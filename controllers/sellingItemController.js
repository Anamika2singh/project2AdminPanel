const config = require("../config/app");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helper = require("../helpers/response");
const { Validator } = require("node-input-validator");
const bcrypt = require("bcrypt");
const sellingItemTable = require("../model/sellingItem");
const utility = require("../helpers/utility");
const { render } = require("ejs");
let saltRounds = 10;
let ObjectId = mongoose.Types.ObjectId;
var empty = require("is-empty");
var tmpMsg = "";

exports.getSellingItems = async (req, res) => {
  try {
    data = [];
    res.render("manageSellingItem", {
      msg: tmpMsg,
      data: data,
      adminData: req.session.admin,
    });
    tmpMsg = "";
  } catch (e) {
    res.render("manageSellingItem", {
      msg: "There is a Problem in displaying Selling Items.",
      data: [],
      adminData: req.session.admin,
    });
    tmpMsg = "";
  }
};
exports.paginateOrders = async (req, res) => {
  //listing of registered users
  try {
    var sort = { createdAt: -1 };
    var search = "";
    var filter = {};
    if (req.body.order[0]["dir"] == "desc" && req.body.order[0]['column'] == '6') {
      sort = { createdAt: -1 };
    }
    if (req.body.order[0]["dir"] == "asc" && req.body.order[0]['column'] == '6') {
      sort = { createdAt: 1 };
    }
    //  console.log("order sorting",req.body.order[0]['dir'])
    //  console.log("order sort", req.body.order[0]['dir'])
    if (req.body.order[0]["dir"] == "desc" && req.body.order[0]['column'] == '3') {
      sort = { unitPrice: -1 };
    }
    if (req.body.order[0]["dir"] == "asc" && req.body.order[0]['column'] == '3') {
      sort = { unitPrice: 1 };
    }
    if (req.body.search.value) {
      search = req.body.search.value;
    }
    if (req.body.filter) {
      filter.status = parseInt(req.body.filter);
    }

    var start = 1;
    if (req.body.start) {
      start = parseInt(req.body.start);
    }
    var length = 1;
    if (req.body.length) {
      length = parseInt(req.body.length);
    }

    let recordsTotal = await sellingItemTable.countDocuments(); // total orders
    if (recordsTotal) {
      recordsTotal = recordsTotal;
    } else {
      recordsTotal = 0;
    }
    let found = await sellingItemTable
      .find({ $and: [{ itemName: { $regex: search, $options: "i" } }, filter] })
      .sort(sort);
    //  .limit(length).skip(start)
    console.log("allitems", found);
    var arr = [];
    var tmp = 0;
    console.log(start, length);
    for (let k = start; k <= length + start - 1; k++) {
      console.log("outer", k);
      if (k > found.length - 1) {
        console.log("inner", k);
        break;
      }
      arr[tmp] = found[k];
      console.log("tmp", tmp);
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

exports.getAddSellingItem = (req, res) => {
  try {
    res.render("addSellingItem", { msg: tmpMsg, adminData: req.session.admin });
    tmpMsg = "";
  } catch (err) {
    console.log(err);
    tmpMsg = "There is a Problem in displaying Add promo Page!";
    res.redirect("/item/getSellingItems");
  }
};
exports.addSellingItem = async (req, res) => {
  try {
    console.log("file lenreq", req.files.length);
    const v = new Validator(req.body, {
      itemName: "required",
      unitPrice: "required",
      description: "required",
    });
    const matched = await v.check();
    let itemName = v.errors.itemName ? v.errors.itemName.message : "";
    let unitPrice = v.errors.unitPrice ? v.errors.unitPrice.message : "";
    let description = v.errors.description ? v.errors.description.message : "";

    if (!matched) {
      let err = itemName + unitPrice + description;
      tmpMsg = err;
      res.redirect("/item/getAddSellingItem");
    } else {
      if (!empty(req.files) && req.files.length <= 3) {
        var itemPics = [];
        var count = 0;
        var isImage = 0;
        for (const [i, value] of req.files.entries()) {
          productImage = req.files[i].filename;
          isImage++;
          count++;
          itemPics.push(productImage);
          utility
            .uploadFile(
              req.files[i].destination,
              req.files[i].filename,
              req.files[i].mimetype,
              config.S3_BUCKET_NAME + "itemImages"
            )
            .then((data) => console.log(data))
            .catch((err) => {
              tmpMsg = "Some Problem Occurred During Uploading Files!";
              res.redirect("/item/getAddSellingItem");
            });
        }
        if (count == req.files.length) {
          sellingItemTable
            .create({
              itemName: req.body.itemName,
              unitPrice: req.body.unitPrice,
              discountPrice: req.body.discountPrice
                ? parseFloat(req.body.discountPrice)
                : 0,
              description: req.body.description,
              itemImages: itemPics,
            })
            .then((product) => {
              // console.log("added item"+product)
              tmpMsg = "Item Added Successfully";
              res.redirect("/item/getSellingItems");
            })
            .catch((err) => {
              tmpMsg = err;
              res.redirect("/item/getAddSellingItem");
            });
        } else {
          tmpMsg = "Some Problem Occurred During Adding Items!";
          res.redirect("/item/getAddSellingItem");
        }
      } else {
        tmpMsg = "You have to add minimum 1 Image and maximum 3 Images!";
        res.redirect("/item/getAddSellingItem");
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = err;
    res.redirect("/item/getAddSellingItem");
  }
};

exports.getUpdateSellingItem = async (req, res) => {
  try {
    let product = await sellingItemTable.findOne({
      _id: ObjectId(req.params.itemID),
    });
    if (product) {
      res.render("updateSellingItem", {
        msg: tmpMsg,
        data: product,
        adminData: req.session.admin,
      });
      tmpMsg = "";
    } else {
      // console.log("no sports found")
      res.render("updateSellingItem", {
        msg: "There is a Problem in displaying Selling Items.",
        data: [],
        adminData: req.session.admin,
      });
      tmpMsg = "";
    }
  } catch (err) {
    tmpMsg = err;
    res.redirect("/item/getUpdateSellingItem/" + req.params.itemID);
  }
};

exports.updateSellingItem = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      itemName: "required",
      unitPrice: "required",
      // discountPrice:'required',
      description: "required",
    });
    const matched = await v.check();
    let itemName = v.errors.itemName ? v.errors.itemName.message : "";
    let unitPrice = v.errors.unitPrice ? v.errors.unitPrice.message : "";
    //  let discountPrice=v.errors.discountPrice?v.errors.discountPrice.message:''
    let description = v.errors.description ? v.errors.description.message : "";
    if (!matched) {
      let err = itemName + unitPrice + description;
      tmpMsg = err;
      console.log(err);
      res.redirect("/item/getUpdateSellingItem/" + req.params.itemID);
    } else {
      var dataToUpdate = {
        itemName: req.body.itemName,
        unitPrice: req.body.unitPrice,
        discountPrice: req.body.discountPrice
          ? parseFloat(req.body.discountPrice)
          : 0,
        description: req.body.description,
        updatedAt: Date.now(),
      };
      if (!empty(req.files)) {
        // }else{

        // }
        if (!empty(req.files) && req.files.length <= 3) {
          var itemPics = [];
          var count = 0;
          var isImage = 0;
          for (const [i, value] of req.files.entries()) {
            productImage = req.files[i].filename;
            isImage++;
            count++;
            itemPics.push(productImage);
            utility
              .uploadFile(
                req.files[i].destination,
                req.files[i].filename,
                req.files[i].mimetype,
                config.S3_BUCKET_NAME + "itemImages"
              )
              .then((data) => console.log(data))
              .catch((err) => {
                tmpMsg = "Some Problem Occurred During Uploading Files!";
                res.redirect("/item/getUpdateSellingItem/" + req.params.itemID);
              });
          }
          dataToUpdate.itemImages = itemPics;
          sellingItemTable.findByIdAndUpdate(
            { _id: req.params.itemID },
            { $set: dataToUpdate },
            (updateErr, updated) => {
              if (updateErr) {
                tmpMsg = "Some Problem Occured during updating Selling Item";
                console.log(tmpMsg);
                res.redirect("/item/getUpdateSellingItem/" + req.params.itemID);
              }
              if (updated) {
                // console.log("updated data",updated.itemImages)

                tmpMsg = "Selling Item Updated Successfully";
                res.redirect("/item/getSellingItems");
                var picsToDelete = updated.itemImages;
                for (const pic of picsToDelete) {
                  utility.deleteS3File(
                    pic,
                    config.S3_BUCKET_NAME + "itemImages"
                  );
                }
              }
            }
          );
        } else {
          tmpMsg = "You have to add minimum 1 Image and maximum 3 Images!";
          res.redirect("/item/getUpdateSellingItem/" + req.params.itemID);
        }
      } else {
        sellingItemTable.findByIdAndUpdate(
          { _id: req.params.itemID },
          { $set: dataToUpdate },
          (updateErr, updated) => {
            if (updateErr) {
              tmpMsg = "Some Problem Occured during updating Selling Item";
              console.log(tmpMsg);
              res.redirect("/item/getUpdateSellingItem/" + req.params.itemID);
            }
            if (updated) {
              // console.log("updated data",updated.itemImages)

              tmpMsg = "Selling Item Updated Successfully";
              res.redirect("/item/getSellingItems");
            }
          }
        );
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Updating Selling Items";
    res.redirect("/item/getUpdateSellingItem/" + req.params.itemID);
  }
};
exports.deleteSellingItem = async (req, res) => {
  try {
    if (!empty(req.params.itemID)) {
      let found = await sellingItemTable.findOne({ _id: req.params.itemID });
      if (found) {
        var picsToDelete = found.itemImages;
        let update = await sellingItemTable.deleteOne({
          _id: ObjectId(req.params.itemID),
        });
        if (update.n) {
          tmpMsg = "Item Deleted SuccessFully";
          res.redirect("/item/getSellingItems");
          for (const pic of picsToDelete) {
            utility.deleteS3File(pic, config.S3_BUCKET_NAME + "itemImages");
          }
        } else {
          tmpMsg = "Not Found it Might be Already Deleted!";
          res.redirect("/item/getSellingItems");
        }
      }
    } else {
      tmpMsg = "This Item Not Found";
      res.redirect("/item/getSellingItems");
    }
  } catch (err) {
    tmpMsg = "Some Problem Occured during Deleting Selling Item!";
    res.redirect("/item/getSellingItems");
  }
};

exports.setStatus = async (req, res) => {
  try {
    if (req.params.status == 1) {
      let update = await sellingItemTable.findByIdAndUpdate(
        { _id: req.params.itemID },
        {
          $set: {
            status: 0, // 0 = disable 1= enable
          },
        }
      );
      if (update) {
        tmpMsg = "Item Disable  Successfully!";
        res.redirect("/item/getSellingItems");
      } else {
        tmpMsg = "Some Problem Occured during Item Disable Action!";
        res.redirect("/item/getSellingItems");
      }
    } else {
      let update = await sellingItemTable.findByIdAndUpdate(
        { _id: req.params.itemID },
        {
          $set: {
            status: 1, // 0 = disable 1= enable
          },
        }
      );
      if (update) {
        tmpMsg = "Item Enable Successfully!";
        res.redirect("/item/getSellingItems");
      } else {
        tmpMsg = "Some Problem Occured during Item Enable Action!";
        res.redirect("/item/getSellingItems");
      }
    }
  } catch (err) {
    console.log(err);
    tmpMsg = "Some Problem Occured during Updating Status!";
    res.redirect("/item/getSellingItems");
  }
};
