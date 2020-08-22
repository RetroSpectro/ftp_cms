let createError = require('http-errors');

exports.isLoggedIn = function(req,res,next){
    if(req.user){
        next();
    }
    else{
        next(createError(404, "Page doesn't' exist."))
    }
}

exports.allowEdit = function(req,res,next){
    if (req.user && req.user.id == req.params.user_id) {
        next();
    }
    else{
        next(createError(404, "Page doesn't' exist."))
    }
}

exports.hasAuth = function(req,res,next){
    if(req.user && req.user.is_admin == true){
        next();
    }
    else{
        next(createError(404, "Page doesn't' exist."))
    }
}

