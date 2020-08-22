let models = require("../models");
let bcrypt = require("bcrypt");
const passport = require('passport');
const myPassport = require('../passport_setup')(passport);
let flash = require('connect-flash');
const { isEmpty } = require('lodash');

let generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}


exports.get_main_page = function(req, res, next) {
    res.render('index', { title: 'CMS' });
    models.Role.findAll().then(roles => {
        console.log(roles);

        if(roles.length==0)
        {
               let add = require('./FillRoleTable.js');
                add.addRoles();
        }
    });

  }

  exports.get_add_page = function(req, res, next) {
    models.Role.findAll().then(roles => {
    res.render('admin/add', { title: 'Add User', formData: {}, errors: {}, roles: roles });
    });
  }

  

  exports.add_user= function(req, res, next) {
    return validateUser(errors, req).then(errors => {
        if (!isEmpty(errors)) {
            rerender_signup(errors, req, res, next);
        }
        else {
            let newUser = models.User.build({
                username: req.body.username,
                password:generateHash(req.body.password),
                role: req.body.role,
            });
            
            return newUser.save().then(result => {
                res.redirect("/add_user");
            })
        }
    });
  }