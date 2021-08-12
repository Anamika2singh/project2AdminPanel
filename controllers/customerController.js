const express = require('express');
const app=express()
var isSet = require('isset');
var empty = require('is-empty');
const { models } = require('mongoose');
const userTable = require('../model/user');
const { where } = require('../model/user');
const utility = require("../helpers/utility");
const mailer = require('../helpers/mailer');
var tmpMsg =''

exports.getManageCustomer = async(req,res)=>{
    try{
        data = [];
        res.render('manageCustomer',{msg:tmpMsg,data:data,adminData:req.session.admin});
        tmpMsg = '';
         
          }
         catch(e){             
             res.render('manageCustomer',{msg:'User Not Found!',data:[],adminData:req.session.admin});
             tmpMsg = '';
         }
       }
	   
exports.paginateOrders = async(req,res)=>{    //listing of registered users
	 try {
	var sort = {"createdAt": -1};
	var search = '';
	 var filter = {};
	 if(req.body.order[0]['dir'] == 'desc' && req.body.order[0]['column'] == '6'){
		sort = {"createdAt": -1};
		} 
		console.log("column no:",req.body.order[0]['column'])
		  if(req.body.order[0]['dir'] == 'asc'&& req.body.order[0]['column'] == '6'){
		sort = {"createdAt": 1};
		} 
		console.log("order",req.body.order[0]['dir'])
		if (req.body.order[0]["dir"] == "desc"&& req.body.order[0]['column'] == '1') {
			sort = { name: -1 };
		  }
		  if (req.body.order[0]["dir"] == "asc"&& req.body.order[0]['column'] == '1') {
			sort = { name: 1 };
		  }
		if(req.body.search.value){
			search = req.body.search.value
		  }
    if(req.body.filter)
	{
	  filter.isBlocked = parseInt(req.body.filter);
	}     
	// if(req.body.filter == '1')
	// {
	//   filter.isBlocked = 'Blocked'
	// }
	// if(req.body.filter == '0')
	// {
	//   filter.serviceType = 'UnBlocked'
	// }
	var start = 1;
	if(req.body.start)
 {
	 start= parseInt(req.body.start)
 }
 var length = 1;
	if(req.body.length)
	{
	length= parseInt(req.body.length)
	}
 
   let recordsTotal = await userTable.countDocuments() // total orders
    if(recordsTotal){
    	recordsTotal = recordsTotal
	
      }
     else{
    	recordsTotal= 0
     }
let found = await userTable.find({ $and: [{ $or: [ {"name":{'$regex' : search, '$options' : 'i'}},
{"emailId": {'$regex' :search, '$options' : 'i'}} ] },filter],
},{name:1,emailId:1,countryCode:1,mobileNumber:1,createdAt:1,isBlocked:1,image:1} ).sort(sort)

// .limit(length).skip(start)
	
			var arr = []
			var tmp = 0;
			console.log(start,length)
			for(let k=start;k<=length+start-1;k++)
			{
			console.log("outer",k)
			if(k >found.length-1){
			console.log("inner",k)
			break;
			}         
			arr[tmp] = found[k]
			console.log("tmp",tmp)
			tmp++;
			}
			var data  = JSON.stringify({
			"draw": req.body.draw,
			"recordsFiltered":found.length ,
			"recordsTotal": recordsTotal,
			"data": arr
			});
        if(found){
            res.send(data);
        }
           else{
                return res.json({
                    message:'not found',
                    data:[]
                }, 404);
             
              }
			} catch(e){
				console.log("error",e)
				return res.json({
				  
				  message:e.message,
				  data:[]
			  }, 500);
			   }
}

exports.setAction = async(req,res)=>{
	try
	{       
		if(req.params.isBlocked == 1){
   
			let update = await userTable.findByIdAndUpdate({'_id':req.params.customerId},{
				$set:{
					isBlocked:0, //1 for blocked account 0 for nonBlocked
				}
			}
			)
			if(update){
				//  console.log("update unblock data of customer",update)
				// tmpMsg = 'User unBlocked Successfully!';
                if(!empty(update.emailId)){
					// message email body
					   let message = `You are successfully UnBlocked by Admin. Enjoy The VALET-IT services.`;
					   // Send confirmation email
					   mailer.sendActionUpdate(
						      update.emailId,
						      message,
							  update.name
					   ).then(success=>{
							console.log("User Unblocked Email Sent!")
					   }).catch(error=>{
						   console.log(error)
					   });
					  }


				res.redirect('/customer/getViewCustomerProfile/'+req.params.customerId);
				if(update.pushNotification == 1)
				{
				if(update.deviceType == 'android')
				{
				  let data = {
					title:"VALET-IT",
					message:"You are successfully UnBlocked by Admin. Enjoy The VALET-IT services.",
					deviceType:"android",
					notificationType:"blockActionByAdmin",
					isBlocked:"0"
				  }
				  let token = update.deviceToken
				  utility.sendFCMNotificationToAndroid(data,token)
				}else if(update.deviceType == 'ios')
				{
				  let data = {
					title:"VALET-IT",
					message:"You are successfully UnBlocked by Admin. Enjoy The VALET-IT services.",
					deviceType:"ios",
					notificationType:"blockActionByAdmin",
					isBlocked:"0"
				  }
				  let notification = {
                    title:"VALET-IT",
                    body:"You are successfully UnBlocked by Admin. Enjoy The VALET-IT services."
                 }
				  let token = update.deviceToken
				  utility.sendFCMNotificationToIOS(notification,data,token)
				}
			}
			}
			else{
				tmpMsg = 'Some Problem Occured during unBlocking User!';
				res.redirect('/customer/getViewCustomerProfile/'+req.params.customerId);
			}
			
	}
	else if(req.params.isBlocked == 0){
		let update = await userTable.findByIdAndUpdate({'_id':req.params.customerId},{
			$set:{
				isBlocked:1, //1 for blocked account 0 for nonBlocked
			}
		}
		)
		if(update){
			// console.log("update block data of customer",update)
			// tmpMsg = 'User Blocked Successfully!';
 
            if(!empty(update.emailId)){
				// message email body
				   let message = `Hey! ,You are Blocked.Kindly contact to Admin.`;
				   // Send confirmation email
				   mailer.sendActionUpdate(
						  update.emailId,
						  message,
						  update.name
				   ).then(success=>{
						console.log("User Blocked Email Sent!")
				   }).catch(error=>{
					   console.log(error)
				   });
				  }

				  res.redirect('/customer/getViewCustomerProfile/'+req.params.customerId);
			if(update.pushNotification == 1)
				{
			if(update.deviceType == 'android')
				{
				  let data = {
                    title:"VALET-IT",
                    message:"Hey! ,You are Blocked.Kindly contact to Admin.",
                    deviceType:"android",
                    notificationType:"blockActionByAdmin",
                    isBlocked:"1"
                  }
				  let token = update.deviceToken
				  utility.sendFCMNotificationToAndroid(data,token)
				}else if(update.deviceType == 'ios')
				{
				  let data = {
					title:"VALET-IT",
					message:"Hey! ,You are Blocked.Kindly contact to Admin.",
					deviceType:"ios",
					notificationType:"blockActionByAdmin",
					isBlocked:"1"
				  }
				  let notification = {
                    title:"VALET-IT",
                    body:"Hey! ,You are Blocked.Kindly contact to Admin."
                 }
				  let token = update.deviceToken
				  utility.sendFCMNotificationToIOS(notification,data,token)
				}
			}
		}
		else{
			tmpMsg = 'Some Problem Occured during Blocking User!';
			res.redirect('/customer/getViewCustomerProfile/'+req.params.customerId);
		}
	}
	}catch(err){
	           console.log("error during blocking user ",err)
	         tmpMsg = 'Some Problem Occured during Updating Action!';
			 res.redirect('/customer/getViewCustomerProfile/'+req.params.customerId);
	}
}

exports.getViewCustomerProfile= async(req,res)=>{
	let found = await userTable.findOne({'_id':req.params.customerId})
	if(found){
		  console.log(found)
			res.render('viewCustomerProfile',{msg:tmpMsg,userData:found,adminData:req.session.admin})
	}
	else{
      res.render('viewCustomerProfile',{msg:"User Not Found!",userData:[],adminData:req.session.admin})
	}
}
 