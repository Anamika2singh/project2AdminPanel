const express = require('express')
const app = express()
var isSet = require('isset')
var empty = require('is-empty')
const { models, Mongoose } = require('mongoose')
const mongoose = require('mongoose');
const userTable = require('../model/user')
const orderTable = require('../model/order')
const sellilngItemOrders = require('../model/sellingOrder')
const { where, aggregate } = require('../model/user')
const { koa } = require('node-input-validator')
const mailer = require('../helpers/mailer');
var tmpMsg = ''

exports.getOrders = async (req, res) => {
  // res.render('manageDatatable', {
  //       msg: tmpMsg,
  //       adminData: req.session.admin,
  //     })
  try {
    data = []
    res.render('manageOrder', {
      msg: tmpMsg,
      data: data,
      adminData: req.session.admin,
    })
    tmpMsg = ''
  } catch (e) {
    res.render('manageOrder', {
      msg: 'There is a Problem in displaying Orders.',
      data: [],
      adminData: req.session.admin,
    })
    tmpMsg = ''
  }
}

exports.paginateOrders = async (req, res) => {
  try {
   
    var sort = { deliveryDate: -1 }
    var search = '';
    var filter = {}
    if (req.body.order[0]['dir'] == 'desc' && req.body.order[0]['column'] == '8') {
      sort = { deliveryDate: -1 }
    }
    if (req.body.order[0]['dir'] == 'asc' && req.body.order[0]['column'] == '8') {
      sort = { deliveryDate: 1 }
    }
    console.log('order', req.body.order[0]['dir'])
    if (req.body.search.value) {
      search = req.body.search.value
    }
    if (req.body.filter == '1') {
      filter.serviceType = 'Mobile Service'
    }
    if (req.body.filter == '0') {
      filter.serviceType = 'Unit Based'
    }
    console.log('filter value', filter)
    var start = 1
    if (req.body.start) {
      start = parseInt(req.body.start)
    }
    var length = 1
    if (req.body.length) {
      length = parseInt(req.body.length)
    }

    let recordsTotal = await orderTable.countDocuments() // total orders
    if (recordsTotal) {
      recordsTotal = recordsTotal
    } else {
      recordsTotal = 0
    }
    let recordsFiltered = recordsTotal
    let found = await orderTable.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $lookup: {
          from: 'providers',
          localField: 'providerId',
          foreignField: '_id',
          as: 'providerDetails',
        },
      },
      {
        $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$providerDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          orderId: 1,
          createdAt: 1,
          serviceType: {
            $cond: {
              if: {
                $eq: ['$serviceType', 0],
              },
              then: 'Unit Based',
              else: 'Mobile Service',
            },
          },

          estimatedTotalCost: 1,
          deliveryDate: 1,
          choosePaymentMethods:1,
          // choosePaymentMethods: {
          //   $cond: {
          //     if: {
          //       $eq: ['$choosePaymentMethods', 0],
          //     },
          //     then: 'COD',
          //     else: 'Credit Card',
          //   },
          // },

          customerName: '$customerDetails.name',
          providerName: '$providerDetails.name',
          status: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 0] }, then: 'New' },
                { case: { $in: ['$status', [1, 2, 3, 4]] }, then: 'OnGoing' },
                { case: { $in: ['$status', [5, 6, 7]] }, then: 'Past' },
              ],
              default: '', 
            },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { providerName: { $regex: search, $options: 'i' } },
                { orderId: { $regex: search, $options: 'i' } },
              ],
            },
            filter,
          ],
        },
      },
      { $sort: sort },
      // {$skip:start}
      // ,
      // {$limit:length},
    ])
    var arr = []
    var tmp = 0
    console.log(start, length)
    for (let k = start; k <= length + start - 1; k++) {
      console.log('outer', k)
      if (k > found.length - 1) {
        console.log('inner', k)
        break
      }
      arr[tmp] = found[k]
      console.log('tmp', tmp)
      tmp++
    }
    var data = JSON.stringify({
      draw: req.body.draw,
      recordsFiltered: found.length,
      recordsTotal: recordsTotal,
      data: arr,
    })

    if (found) {
      res.send(data)
    } else {
      return res.json(
        {
          message: 'not found',
          data: [],
        },
        404,
      )
    } 
  } catch (e) {
    console.log('error', e)
    return res.json(
      {
        message: e.message,
        data: [],
      },
      500,
    )
  }
}

exports.getItemOrder = async (req, res) => {
  try {
    data = []
    res.render('manageItemOrder', {
      msg: tmpMsg,
      data: data,
      adminData: req.session.admin,
    })
    tmpMsg = ''
  } catch (e) {
    res.render('manageItemOrder', {
      msg: 'There is a Problem in displaying Orders.',
      data: [],
      adminData: req.session.admin,
    })
    tmpMsg = ''
  }
}

exports.paginateItemOrders = async (req, res) => {
  try {
    console.log(req.body);
    var sort = { status: 1 }
    var search = ''
    var filterT = {}
    if (req.body.order[0]['dir'] == 'desc'&& req.body.order[0]['column'] == '8') {
      sort = { createdAt: -1 }
    }
    if (req.body.order[0]['dir'] == 'asc'&& req.body.order[0]['column'] == '8') {
      sort = { createdAt: 1 }
    }
    // console.log('order', req.body.order[0]['dir'])

    if (req.body.search.value) {
      search = req.body.search.value
    }
    if (req.body.filter == '0') {
      filterT = { status: parseInt(req.body.filter) }
      // filterT.status = 'New'
    } else if (req.body.filter == '12') {
      filterT = { $or: [{ status: parseInt(1) }, { status: parseInt(2) }] }
      //
      // filterT.status = 'OnGoing'
    } else if (req.body.filter == '34') {
      filterT = {
        $or: [
          { status: parseInt(3) },
          { status: parseInt(4) },
          { status: parseInt(5) },
        ],
      }
      // filterT.status = 'Past'
    } else {
      filterT = {}
    }
    console.log('to check filter', filterT)
    var start = 1
    if (req.body.start) {
      start = parseInt(req.body.start)
    }
    var length = 1
    if (req.body.length) {
      length = parseInt(req.body.length)
    }

    let recordsTotal = await sellilngItemOrders.countDocuments() // total orders
    if (recordsTotal) {
      recordsTotal = recordsTotal
    } else {
      recordsTotal = 0
    }
    let found = await sellilngItemOrders.aggregate([
      //  {"$match": filterT},
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },

      {
        $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          orderId: 1,
          createdAt: 1,
          estimatedTotalCost: 1,
          choosePaymentMethods:1,
          // choosePaymentMethods: {
          //   $cond: {
          //     if: {
          //       $eq: ['$choosePaymentMethods', 0],
          //     },
          //     then: 'COD',
          //     else: 'Credit Card',
          //   },
          // },
          customerName: '$customerDetails.name',
          status: 1,
          subscriptionDiscount:1,
          deliveryFee:1,
          subTotal:1,
          // status: {
          //   "$switch": {
          //     "branches": [
          //       { "case": { "$eq": [ "$status", 0 ] }, "then": "New" },
          //       { "case": { "$in" : ['$status', [1,2]] }, "then": "OnGoing" },
          //       { "case": { "$in" : ['$status', [3,4,5]] }, "then": "Past" },
          //     ],
          //     "default": ''
          //   }
          // },
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { customerName: { $regex: search, $options: 'i' } },
                { orderId: { $regex: search, $options: 'i' } },
              ],
            },
            filterT,
          ],
        },
      },

      { $sort: sort },

      // {$skip:start}
      // ,
      // {$limit:length},
    ])
    var arr = []
    var tmp = 0
    // console.log(start, length)
    for (let k = start; k <= length + start - 1; k++) {
      //  console.log("outer",k)
      if (k > found.length - 1) {
        //  console.log("inner",k)
        break
      }
      arr[tmp] = found[k]
      //  console.log("tmp",tmp)
      tmp++
    }
    var data = JSON.stringify({
      draw: req.body.draw,
      recordsFiltered: found.length,
      recordsTotal: recordsTotal,
      data: arr,
    })
    if (found) {
      // console.log("found",found);
      res.send(data)
    } else {
      return res.json(
        {
          message: 'not found',
          data: [],
        },
        404,
      )
    }
  } catch (e) {
    console.log('error', e)
    return res.json(
      {
        message: e.message,
        data: [],
      },
      500,
    )
  }
}

exports.orderAction = async (req, res) => {
  try {
    let found = await sellilngItemOrders.findOne({ _id: req.params.orderId })
    if (found) {
       
      let update = await sellilngItemOrders.findByIdAndUpdate(
        { _id: found._id },
        {
          $set: { 
            status: req.params.type, //5= reject order 1 = accept order
          },
         },
      )

      if (update) {
        console.log("update data",update)

        var userData = await sellilngItemOrders.aggregate([
          {$match:{'_id':mongoose.Types.ObjectId(update._id)}}, 
          {
            $lookup:
              {
                from: "users",
                localField: "customerId",
                foreignField: "_id",
                as: "userDetails"
              }
        }
        ,
        {"$unwind": "$userDetails" }, 
        {$project:{
          status:1,
           userEmailId:'$userDetails.emailId',
           userName:'$userDetails.name'
        }}
      ])
   console.log("with user details",userData[0])

 
        if (req.params.type == 1) {
          // tmpMsg = 'Successfully Order accepted!';
          res.redirect('/order/getItemOrder')

          if(!empty(userData[0].userEmailId)){
            // message email body
               let message = `Your Order Accepted Successfully by Admin. Enjoy The VALET-IT services.`;
               // Send confirmation email
               mailer.sendActionUpdate(
                   userData[0].userEmailId,
                    message,
                    userData[0].userName
               ).then(success=>{
                console.log("Order accepted Email Sent!")
               }).catch(error=>{
                 console.log(error)
               });
              }
          
         
        } else if (req.params.type == 5) {
          // tmpMsg = 'Successfully rejected!';       
          res.redirect('/order/getItemOrder')

          if(!empty(userData[0].userEmailId)){
            // message email body
               let message = `Hey! ,Your Order Rejected.Kindly contact to Admin.`;
               // Send confirmation email
               mailer.sendActionUpdate(
                userData[0].userEmailId,
                message,
                userData[0].userName
               ).then(success=>{
                console.log("Order rejected Email Sent!")
               }).catch(error=>{
                 console.log(error)
               });
              }
                   
        }
      } else {
        tmpMsg = 'Some Problem Occured during updating Order Action!'
        res.redirect('/order/getItemOrder')
      }
    } else {
      tmpMsg = 'Order Not Found!'
      res.redirect('/order/getItemOrder')
    }
  } catch (err) {
    console.log(err)
    tmpMsg = 'Some Problem Occured during updating Order Action!'
    res.redirect('/order/getItemOrder')
  }
}
exports.getViewOrder = async(req,res)=>{
try{
  console.log("orderID",req.params.orderId)
    let found = await sellilngItemOrders.aggregate([
      {$match:{'_id':mongoose.Types.ObjectId(req.params.orderId)}},
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {$unwind:{ path: '$customerDetails', preserveNullAndEmptyArrays: true }},
      {$project:{
        name:'$customerDetails.name',
        emailId:'$customerDetails.emailId',
        countryCode:'$customerDetails.countryCode',
        mobileNumber:'$customerDetails.mobileNumber',
        image:'$customerDetails.image',
        orderId:1,createdAt:1,estimatedTotalCost:1,deliveryAddress:1,
        cartItems:1,
        
      }}
    ])
    
    console.log("order details..",found)
if(found){
    res.render("viewItemOrder", {
      msg: tmpMsg,
      userData:found[0],
      adminData: req.session.admin,
    });
    tmpMsg = "";
  } else {
    res.render("viewItemOrder", {
       msg: "There is a Problem in displaying Order Details.",
       userData: [],
      adminData: req.session.admin,
    });
    tmpMsg = "";
  }
 }
catch (e) {
  console.log("problem" + e);
  res.render("viewItemOrder", {
    msg: "There is a Problem in displaying Order Details.",
    userData: [],
    adminData: req.session.admin,
  });
  tmpMsg = "";
}
}


    
