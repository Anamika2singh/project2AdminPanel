const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const contentController = require('../controllers/contentController')
var multer = require("multer");



router.get('/getPrivacyPolicyContent',verifyAdmin,contentController.getPrivacyPolicyContent)
router.get('/getTermsContent',verifyAdmin,contentController.getTermsContent)
router.get('/getPaymentRefundContent',verifyAdmin,contentController.getPaymentRefundContent)

router.post('/addPrivacyPolicy/:type',verifyAdmin,contentController.addPrivacyPolicy)
router.post('/addTermsCondition/:type',verifyAdmin,contentController.addTermsCondition)
router.post('/addPaymentRefund/:type',verifyAdmin,contentController.addPaymentRefund)



router.post('/updateContent/:contentID/:types',verifyAdmin,contentController.updateContent)


module.exports = router;