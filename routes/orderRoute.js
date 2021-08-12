const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')

const orderController = require('../controllers/orderController');
var multer = require("multer");

 router.get('/getOrders',verifyAdmin,orderController.getOrders)
router.get('/getItemOrder',verifyAdmin,orderController.getItemOrder);
router.post('/paginate-orders', verifyAdmin,orderController.paginateOrders);
router.post('/paginateItemOrders', verifyAdmin,orderController.paginateItemOrders);
router.get('/orderAction/:type/:orderId',verifyAdmin,orderController.orderAction);
router.get('/getViewOrder/:orderId',verifyAdmin,orderController.getViewOrder);
module.exports = router;