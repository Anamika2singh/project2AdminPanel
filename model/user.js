const mongoose = require('mongoose')
const Schema = mongoose.Schema
const signup = new Schema({
       name:{type:String},
       emailId:{type:String,required:true},
       countryCode:{type:String},
       mobileNumber:{type:Number},
       password : {type:String,default:''},
       image:{type:String,default:''},
       deviceType:{type:String,default:''},
       deviceToken:{type:String,default:''},
    
      favProviders:{type:[mongoose.Types.ObjectId],default:[]},   
        addressWithLatLng:[{
                    location: {
                            type: {
                              type: String, // Don't do `{ location: { type: String } }`
                              enum: ['Point'], // 'location.type' must be 'Point'
                              default:'Point'
                              },
                           coordinates: {
                              type: [],
                              default:[]
                              }
                            },    
                    address:{
                           addressType:{
                              type:String,  
                              default:''
                              },
                            fullAddress:{
                               type:String,
                               default:''
                              },
                            city:{type:String,default:''},
                            state:{type:String,default:''},
                            country:{type:String,default:''},
                            lat:{type:String,default:''},
                            long:{type:String,default:''}
                      }  
          }],
       paymentMethods:[{  //to add all payments methods
         
           nameOnCard:{type:String,default:''},
           cardNumber:{type:String,default:''},
           expiryDate:{type:String,default:''},
           cvv:{type:String,default:''},
           default:{type:Number,default:0}//use for payment
           
       }],
       
       pushNotification:{type:Number,default:0},//1 for enable notification and 0 for disable
        //User's Setting 
       evaluation:{type:Number,default:0},//0 for to show all 1 for LtoH and 2 for HtoL
       distance:{type:Number,default:0},//0 for to show all providers 1 for view nearest first
       favourites:{type:Number,default:0},//1 for to show  favourites first 0 to show all
       distance:{type:Number,default:5},//default 5 km
       deliveryOption:{type:Number,default:2},//1 for pickandDrop and 0 for SelfDriving and 2 for to show both type of providers 
       
       signUpBy:{type:Number,required:true},//Enter 1 for locally 2 for google 3 for facebook 4 for apple
       facebookId:{type:String},
       googleId:{type:String},
       appleId:{type:String},

      isBlocked:{type:Number,default:0},//1 for blocking user and 0 for unblock     
       status:{type:Number,default:0},
       createdAt:{type:Date,default:Date.now},
       updatedAt:{type:Date,default:Date.now}
})
module.exports = mongoose.model('users',signup)