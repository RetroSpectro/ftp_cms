let validator = require('validator');
let models = require('../models');

const validateCreateUserField = function(errors, req){
    if(!validator.isAscii(req.body.password)){
        errors["password"]="Invalid characters in password";
    }
    if(!validator.isLenght(req.body.password,{min:8,max:25})){
        errors["password"]="Please ensure that password hav >8 and <25 characters"; 
    }
}

exports.validateUser = function(errors,req){
    return new Promise(function(resolve,reject){
        return models.User.findOne({
            where:{
                username: req.body.username
            }
        }).then(u=>{
            if(u!==null){
                errors["username"] = "Username is already in use";
            }
            resolve(errors);
        })
   
    })
   
}