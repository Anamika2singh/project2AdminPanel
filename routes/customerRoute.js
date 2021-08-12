const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const customerController = require('../controllers/customerController')
var multer = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images/" , function(err , succ) {
            if(err)
                throw err

        });
    },
    filename: function (req, file, cb) {        
        var name  = (Date.now()+ Date.now() +file.originalname);
        name = name.replace(/ /g,'-');       
        cb(null, name , function(err , succ1) { 
            if(err)
                throw err

        });
    }
});
const upload = multer({ storage: storage, limits: 1000000});

router.get('/getManageCustomer',verifyAdmin,customerController.getManageCustomer);
router.get('/setAction/:isBlocked/:customerId',verifyAdmin,customerController.setAction);
router.get('/getViewCustomerProfile/:customerId',verifyAdmin,customerController.getViewCustomerProfile)
router.post('/paginate-orders', verifyAdmin,customerController.paginateOrders);
module.exports = router;