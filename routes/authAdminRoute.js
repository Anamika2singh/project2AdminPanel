const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const authAdminController = require('../controllers/authAdminController')
// var multer = require("multer");

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./public/images/" , function(err , succ) {
//             if(err)
//                 throw err

//         });
//     },
//     filename: function (req, file, cb) {        
//         var name  = (Date.now()+ Date.now() +file.originalname);
//         name = name.replace(/ /g,'-');       
//         cb(null, name , function(err , succ1) {
//             if(err)
//                 throw err

//         });
//     }
// });

// const upload = multer({ storage: storage, limits: 1000000});

router.get('/getLogin',authAdminController.getLogin)
router.post('/login', authAdminController.login);
router.get('/getEditProfile',verifyAdmin,authAdminController.getEditProfile );
router.post('/editProfile',verifyAdmin,authAdminController.editProfile);
router.get('/getUpdatePassword',verifyAdmin,authAdminController.getUpdatePassword)
router.post('/updatePassword',verifyAdmin,authAdminController.updatePassword)

router.get('/getForgotPassword',authAdminController.getForgotPassword);
router.post("/sendPasswordResetEmail",authAdminController.sendPasswordResetEmail);

router.get('/getResetPassword',authAdminController.getResetPassword)
router.post("/resetPassword",authAdminController.resetPassword);
router.get("/verifyToken/:token",authAdminController.verifyToken);


router.get("/logout", verifyAdmin ,authAdminController.logout);
module.exports = router;