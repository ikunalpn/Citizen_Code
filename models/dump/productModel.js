// models/productModel.js
const pool = require('../config/db');

const Product = {
    create: async (name, price, discount, bgColor, panelColor, textColor, image) => {
        const [result] = await pool.execute(
            'INSERT INTO products (Name, Price, Discount, BgColor, PanelColor, TextColor, Image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, price, discount, bgColor, panelColor, textColor, image]
        );
        return result.insertId;
    },
    getAll: async () => {
        const [rows] = await pool.execute('SELECT * FROM products');
        return rows;
    },
    // Add other product-related database operations here (e.g., getById, update, delete)
};

module.exports = Product;