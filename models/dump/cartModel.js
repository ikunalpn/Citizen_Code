// models/cartModel.js
const pool = require('../config/db');

const Cart = {
    addItem: async (userId, productId, quantity) => {
        const [result] = await pool.execute(
            'INSERT INTO UserCarts (UserID, ProductID, Quantity) VALUES (?, ?, ?)',
            [userId, productId, quantity]
        );
        return result.insertId;
    },
    getCart: async (userId) => {
        const [rows] = await pool.execute('SELECT * FROM UserCarts WHERE UserID = ?', [userId]);
        return rows;
    },
    // Add cart related functions.
};
module.exports = Cart;