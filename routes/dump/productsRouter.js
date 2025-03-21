const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig")
const productController = require('../controllers/productController');

router.post('/create', upload.single('image'), productController.createProduct);

module.exports = router;