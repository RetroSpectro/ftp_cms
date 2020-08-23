let models = require("../models");
let bcrypt = require("bcrypt");
const passport = require('passport');
const myPassport = require('../passport_setup')(passport);
let flash = require('connect-flash');
const { isEmpty } = require('lodash');
const { validateUser } = require('../validators/add');
var fs = require('fs');
const { promisify } = require('util')

const readdir = promisify(require('fs').readdir)
const stat = promisify(require('fs').stat)


const basedir = "/home/mikesb/temp/";

let generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}


exports.get_main_page = function(req, res, next) {
    res.render('index', { title: 'CMS',user: req.user });
    models.Role.findAll().then(roles => {
        
        if(roles.length==0)
        {
               let add = require('./FillRoleTable.js');
                add.addRoles();
        }
    });

  }

  exports.get_add_page = function(req, res, next) {
    models.Role.findAll().then(roles => {
    res.render('admin/add', { title: 'Add User', formData: {}, errors: {}, roles: roles,user: req.user });
    });
  }

  
const rerender = function (errors, req, res, next) {
    models.Role.findAll().then(roles => {
    res.render('admin/add', {title: 'Add User', formData: req.body, errors: errors, roles: roles,user: req.user  });
});
}

  exports.add_user= function(req, res, next) {
    let errors = {};
    return validateUser(errors, req).then(errors => {
        if (!isEmpty(errors)) {
            rerender(errors, req, res, next);
        }
        else {
            let newUser = models.User.build({
                username: req.body.username,
                password:generateHash(req.body.password),
                role: req.body.role
            });
            
            return newUser.save().then(result => {
                res.redirect("/add");
            })
        }
    });
  }


  exports.get_ftp_page = function(req, res, next) {
    return models.User.findAll().then(users=>{
        console.log(users)
        res.render('admin/ftp', { title: 'FTP',user: req.user, users: users });
    })
  }

   function createDir(dirname){
     fs.mkdirSync(basedir+dirname);
  }

 async function readDir(dirname)
  {
    const pathContent = [];

    let files = await readdir(dirname)
    



    for (let file of files) {
        // get file info and store in pathContent
        try {
        let stats = await stat(dirname + '/' + file)
        if (stats.isFile()) {

            pathContent.push({
            time:stats.birthtime,
            name: file.substring(0, file.lastIndexOf('.')),
            type: file.substring(file.lastIndexOf('.') + 1).concat(' File'),
            })
        } else if (stats.isDirectory()) {
            pathContent.push({
            time:stats.birthtime,
            name: file,
            type: 'Directory',
            });
        }
        } catch (err) {
        console.log(`${err}`);
        }
    }
    return pathContent;
  }

  async function modifyDirs(container)
  {
    let arr = [];
    for(let i = 0; i<container.length ; i++){
        await   models.UserFile.findOne({where:{
         file: container[i].name
        }}).then(info=>{
           
            arr.push({
                time: container[i].time,
                name:  container[i].name,
                type:  container[i].type,
                user:info.username,
                role: info.role
                })
        })
    
    }
    console.log(arr)
    return arr;

  }

  exports.add_working_dir = function(req, res, next) {

   return models.User.findOne({where:{
        username:req.body.username
    }}).then(user => {
        
        createDir(req.body.file);

        let UserFile = models.UserFile.build({
            username: req.body.username,
            role: user.role,
            file: req.body.file
        });

        return UserFile.save().then(result => {
            res.redirect("/ftp");
        })
    });

}
exports.get_ftp_dir =  function(req, res, next) {

   
    readDir(basedir).then((pathContent) => {
    
        modifyDirs(pathContent).then((arr)=>{
            console.log("here"+arr)
            res.render('admin/dir', { title: 'FTP', dirs:  arr, user: req.user});

        });
        
      
      }, (err) => {
        res.status(422).json({
          message: `${err}`
        });
      })
  }

  exports.get_modered_dir =  function(req, res, next) {

    readDir(basedir+req.params.dir).then((pathContent) => {
    
        res.render('admin/dir', { title: 'FTP', dirs:  pathContent, user: req.user});

      }, (err) => {
        res.status(422).json({
          message: `${err}`
        });
      })
  }