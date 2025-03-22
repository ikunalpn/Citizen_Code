const jwt = require('jsonwebtoken');
const jwtSecret = require("../config/jwtSecret").jwtSecret; // Access jwtSecret correctly
const db = require('../config/db'); // Assuming you have your database connection

const authMiddleware = (roles) => {
    return async (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            const userId = decoded.citizenId || decoded.addresserId;
        
            let name = null;
            if (decoded.role === 'citizen') {
                const [citizenRows] = await db.query('SELECT name FROM Citizen WHERE citizen_id = ?', [userId]);
                if (citizenRows.length > 0) {
                    name = citizenRows[0].name;
                }
            } else if (decoded.role === 'addresser') {
                const [addresserRows] = await db.query('SELECT name FROM Addresser WHERE addresser_id = ?', [userId]);
                if (addresserRows.length > 0) {
                    name = addresserRows[0].name;
                }
            }
        
            req.user = {
                ...decoded,
                name: name,
            };
        
            if (roles && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        
            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            console.error("JWT Secret:", jwtSecret);
            return res.status(401).json({ message: 'Token is not valid', error: error.message });
        }
    };
};

module.exports = authMiddleware;