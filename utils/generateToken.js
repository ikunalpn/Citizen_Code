const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    console.log(process.env.JWT_SECRET);
    return jwt.sign({ userId: user.userId, email: user.email},process.env.JWT_SECRET)
    
}

module.exports.generateToken = generateToken;