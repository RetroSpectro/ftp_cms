
let models = require("../models");
let bcrypt = require("bcrypt");
const passport = require('passport');
const myPassport = require('../passport_setup')(passport);
let flash = require('connect-flash');
const { isEmpty } = require('lodash');
const { validateUser } = require('../validators/signup');



  exports.get_login_page = function(req, res, next) {
    res.render('auth/login', { formData: {}, errors: {} });
  }
  

exports.login = function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next)
}

exports.logout = function (req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
}
