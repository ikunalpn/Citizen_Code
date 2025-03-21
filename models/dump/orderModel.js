// models/orderModel.js
const pool = require('../config/db');

const Order = {
    createOrder: async (userId, totalAmount, shippingAddress) => {
        const [result] = await pool.execute(
            'INSERT INTO UserOrders (UserID, TotalAmount, ShippingAddress) VALUES (?, ?, ?)',
            [userId, totalAmount, shippingAddress]
        );
        return result.insertId;
    },
    //Add Order related functions.
};
module.exports = Order;