const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middlewares/verifyAdmin')
const indexController = require('../controllers/indexController')


router.get('/',indexController.homePage)
router.get('/dashboard', verifyAdmin ,indexController.dashboard);
router.post('/updateDeliveryFee', verifyAdmin ,indexController.updateDeliveryFee);
router.get('/deliveryFee',verifyAdmin,indexController.deliveryFee);
module.exports = router;