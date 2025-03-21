const express = require("express");
const { authPlugins } = require("mysql2");
const router = express.Router();
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');

router.get("/", function (req, res) {
    res.send("hey it's working");
})

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);
router.get('/shop', productController.getShopProducts);

module.exports = router;