const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const providerController = require('../controllers/providerController')
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

router.get('/getManageProvider',verifyAdmin,providerController.getManageProvider);
router.get('/approvalAction/:type/:providerId',verifyAdmin,providerController.approvalAction);

router.get('/getViewProfile/:providerId',verifyAdmin,providerController.getViewProfile)
router.get('/sellPermission/:permissionForSell/:ProviderID',verifyAdmin,providerController.sellPermission);
router.post('/paginate-orders',verifyAdmin,providerController.paginateOrders);

module.exports = router;