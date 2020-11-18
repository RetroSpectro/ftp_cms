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


        let bcrypt = require("bcrypt");
        let generateHash = function (password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
        }
        let newUser = models.User.build({
            username: "root",
            password: generateHash("root"),
            role: "admin"
        });

        return newUser.save().then(result => {
            console.log("admin");
        })

    return null;
}