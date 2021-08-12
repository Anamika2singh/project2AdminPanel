const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')

const sellingItemController = require('../controllers/sellingItemController')
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
// var cpUpload = upload.fields([{ name: 'itemImages', maxCount: 3}
 
// ])
router.get('/getSellingItems',verifyAdmin,sellingItemController.getSellingItems)

router.get('/getAddSellingItem',verifyAdmin,sellingItemController.getAddSellingItem)
router.post('/addSellingItem',verifyAdmin,upload.any(),sellingItemController.addSellingItem)

router.get('/getUpdateSellingItem/:itemID',verifyAdmin,sellingItemController.getUpdateSellingItem)
router.post('/updateSellingItem/:itemID',verifyAdmin,upload.any(),sellingItemController.updateSellingItem)

router.get('/setStatus/:status/:itemID',verifyAdmin,sellingItemController.setStatus);
router.get('/deleteSellingItem/:itemID',verifyAdmin,sellingItemController.deleteSellingItem);
router.post('/paginate-orders', verifyAdmin,sellingItemController.paginateOrders);

module.exports = router; 