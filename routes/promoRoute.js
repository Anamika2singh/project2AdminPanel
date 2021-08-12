const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const promoController = require('../controllers/promoController')
var multer = require("multer");


router.get('/getPromoCode',verifyAdmin,promoController.getPromoCode)

router.get('/getAddPromoCode',verifyAdmin,promoController.getAddPromoCode)
router.post('/addPromoCode',verifyAdmin,promoController.addPromoCode)

router.get('/getUpdatePromoCode/:promoID',verifyAdmin,promoController.getUpdatePromoCode)
router.post('/updatePromoCode/:promoID',verifyAdmin,promoController.updatePromoCode)

router.get('/deletePromoCode/:promoID',verifyAdmin,promoController.deletePromoCode)

router.get('/setAction/:action/:promoID',verifyAdmin,promoController.setAction);


module.exports = router;