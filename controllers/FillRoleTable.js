const models = require('../models');

module.exports.addRoles = function (res, req, next) {

    let array = ["admin", "moder", "editor", "blank"];

        let role = [];
        for (let i = 0; i < array.length; i++) {
            role[i] = models.Role.build({
                name: array[i]
        }) ;
           
        }
   
        for (let i = 0; i < role.length; i++) {
            role[i].save().then(result=>{
                console.log("added");
            });
           
        }

    return null;
}