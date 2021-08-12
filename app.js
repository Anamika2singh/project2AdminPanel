const config = require('./config/app')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const ejs = require('ejs')
const path = require('path')
app.locals.moment = require('moment');
const indexRoute = require('./routes/indexRoute')
const authAdminRoute = require('./routes/authAdminRoute')
const customerRoute = require('./routes/customerRoute')
const providerRoute = require('./routes/providerRoute')
const carRoute = require('./routes/carRoute')
const orderRoute = require('./routes/orderRoute')
const promoRoute = require('./routes/promoRoute')
const contentRoute = require('./routes/contentRoute')
const sellingItemRoute = require('./routes/sellingItemRoute')
const fs = require('fs')
let https = require("https");
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

var session = require('express-session');
var response = require('./helpers/response')
//database coonection with mongodb
mongoose.Promise = global.Promise;
mongoose.connect(
  config.MONGODB_URL , { useNewUrlParser: true, useUnifiedTopology: true }) 
         .then(() => console.log("connection successful"))
          .catch((err) => console.error(err));
       
 app.set('view engine','ejs')
 app.use('/',express.static(path.join(__dirname, 'public')));
 app.use('/auth',express.static(path.join(__dirname, 'public')));
 app.use('/customer',express.static(path.join(__dirname, 'public')));
 app.use('/customer/getViewCustomerProfile',express.static(path.join(__dirname, 'public')));
 app.use('/provider',express.static(path.join(__dirname, 'public')));
 app.use('/provider/getViewProfile',express.static(path.join(__dirname, 'public')));
 app.use('/provider/getItemOrder',express.static(path.join(__dirname, 'public')));
 app.use('/car',express.static(path.join(__dirname, 'public')));
 app.use('/order',express.static(path.join(__dirname, 'public')));

 app.use('/order/getOrders',express.static(path.join(__dirname, 'public')));
 app.use('/order/getViewOrder',express.static(path.join(__dirname, 'public')));
 
 app.use('/order/getItemOrder',express.static(path.join(__dirname, 'public')));
 app.use('/promo',express.static(path.join(__dirname, 'public')));
 app.use('/promo/getUpdatePromoCode',express.static(path.join(__dirname, 'public')));
 app.use('/content',express.static(path.join(__dirname, 'public')));
 app.use('/content/getUpdateContent',express.static(path.join(__dirname, 'public')));
 app.use('/item',express.static(path.join(__dirname, 'public')));
 app.use('/item/getUpdateSellingItem',express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json({extended:true}))
app.use(bodyparser.urlencoded({extended:true}))

app.use(express.static('public/images')); 

app.use(session({
  secret: 'newScan@@#@@@#$@@*&$%$@B!@A&*@@R',
  resave: false,
  saveUninitialized: true,
  cookie: {} //{ secure: true }
}))

app.use('/',indexRoute)
app.use('/auth',authAdminRoute)
app.use('/customer',customerRoute)
app.use('/provider',providerRoute)
app.use('/car',carRoute)
app.use('/order',orderRoute)
app.use('/promo',promoRoute)
app.use('/content',contentRoute)
app.use('/item',sellingItemRoute)
// app.listen(config.PORT,()=>{
//     console.log("listening port");
// })

if(config.SSL == "On"){
  const options = {
  key: fs.readFileSync('/etc/ssl/letsencrypt/privkey.pem', 'utf8'),
  cert: fs.readFileSync('/etc/ssl/letsencrypt/cert.pem', 'utf8'),
  ca : fs.readFileSync("/etc/ssl/letsencrypt/chain.pem","utf8")
  };
  https.createServer(options,app).listen(config.PORT)
  }else{
  app.listen(config.PORT || 4000, () => {
  console.log(`Server started ${config.PORT}...`)
  })
  }