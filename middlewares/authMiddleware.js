const jwt = require('jsonwebtoken');

const authMiddleware = (roles) => {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, "mysecret"); // Use your actual secret
            req.user = decoded;

            if (roles && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
    };
};

module.exports = authMiddleware;