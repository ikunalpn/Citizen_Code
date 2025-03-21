const jwt = require("jsonwebtoken");
// require("dotenv").config()
const userModel = require("../models/userModel")

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "you need to login first");
        return res.redirect("/");
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        let user = await userModel.findByEmail({email:decoded.email});

        req.user = user;
        next()
    } catch (error) {
        req.flash("error", "something went wrong");
        res.redirect("/");
    }
    
}