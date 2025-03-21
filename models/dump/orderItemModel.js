// models/orderItemModel.js
const pool = require('../config/db');

const OrderItem = {
    createOrderItem: async (orderId, productId, quantity, price) => {
        const [result] = await pool.execute(
            'INSERT INTO OrderItems (OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?)',
            [orderId, productId, quantity, price]
        );
        return result.insertId;
    },
    //Add orderItem related functions.
};
module.exports = OrderItem;