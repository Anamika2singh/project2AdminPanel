const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const carController = require('../controllers/carController')
const multer = require("multer");

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

router.get('/getCar',verifyAdmin,carController.getCar)

router.post('/addCar',verifyAdmin,upload.single('carImage'),carController.addCar)

router.post('/updateCar/:image/:carID',verifyAdmin,upload.single('carImage'),carController.updateCar)

router.get('/deleteCar/:carID',verifyAdmin,carController.deleteCar)
router.get('/setAction/:action/:carID',verifyAdmin,carController.setAction);
module.exports = router;