// controllers/productController.js
const productModel = require('../models/productModel');

const getShopProducts = async (req, res) => {
    try {
        const products = await productModel.getAll();
        console.log(products);
        
        res.render('shop', { products: products }); // Render shop.ejs
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
};

const createProduct = async (req, res) => {
    try {
        // console.log(req.body);
        // console.log(req.file);
        const { name, price, discount, bgColor, panelColor, textColor } = req.body;
        

        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        } else {
            console.log("No file uploaded"); //Log if no file is uploaded.
        }

        await productModel.create(name, price, discount, bgColor, panelColor, textColor, imagePath);

        req.flash("success", "Product Created Successfully");
        res.redirect("/owners/admin");
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
};
module.exports = {
    getShopProducts,
    createProduct,
};