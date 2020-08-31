let models = require("../models");
let bcrypt = require("bcrypt");
const passport = require('passport');
const myPassport = require('../passport_setup')(passport);
let flash = require('connect-flash');
const { isEmpty } = require('lodash');
const { promisify } = require('util')
const { validateUser } = require('../validators/add');
var fs = require('fs');
var Client = require('jsftp');
var client;
var server = require("../ftp");


const readdir = promisify(require('fs').readdir)
const readfile = promisify(require('fs').readFile)
const stat = promisify(require('fs').stat)

let basedir;
let dirCall = function (nullS, dirname) {
    basedir = dirname + "/";
}

server.getRoot(client, dirCall);

var multer = require('multer');


let generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}
function clientAuth(user, pass, role) {
    client = new Client({
        host: server.host,
        port: server.options.port,
        role: role
    });
    client.auth(
        user,
        pass,
        function (error, response) {
            console.log("ERROR: " + error);
            console.log("RESPONSE: " + response);
        }
    );
    return client;
}

exports.get_main_page = function (req, res, next) {
    if (req.user) {
        client = clientAuth(req.user.username, req.user.password, req.user.role);
        console.log("HERE IS BASEDIR");
        console.log(basedir);
    }
    res.render('index', { title: 'CMS', user: req.user });
    models.Role.findAll().then(roles => {

        if (roles.length == 0) {
            let add = require('./FillRoleTable.js');
            add.addRoles();
        }
    });

}

exports.get_add_page = function (req, res, next) {
    models.Role.findAll().then(roles => {
        res.render('admin/add', { title: 'Add User', formData: {}, errors: {}, roles: roles, user: req.user });
    });
}


const rerender = function (errors, req, res, next) {
    models.Role.findAll().then(roles => {
        res.render('admin/add', { title: 'Add User', formData: req.body, errors: errors, roles: roles, user: req.user });
    });
}

exports.add_user = function (req, res, next) {
    let errors = {};
    return validateUser(errors, req).then(errors => {
        if (!isEmpty(errors)) {
            rerender(errors, req, res, next);
        }
        else {
            let newUser = models.User.build({
                username: req.body.username,
                password: generateHash(req.body.password),
                role: req.body.role
            });

            return newUser.save().then(result => {
                res.redirect("/add");
            })
        }
    });
}


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        console.log(basedir + req.params.dir + "/" + req.params.indir + "/" + file.originalname);

        callback(null, basedir + req.params.dir + "/" + req.params.indir);
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});

var upload = multer({ storage: storage }).single('file');


exports.post_files = function (req, res, next) {

    upload(req, res, function (err) {

        //console.log("owen",req.file,err);
        if (err) {
            console.log(err);
            console.log("file is NOT uploaded");
        }
        else {
            if (req.file) {
                let UserFile = models.UserFile.build({
                    username: req.body.username,
                    role: req.user.role,
                    file: req.params.dir + "/" + req.params.indir + "/" + req.file.filename
                });

                return UserFile.save().then(result => {
                    res.redirect('/dirs/' + req.params.dir + "/" + req.params.indir);

                })
            }


        }
    });
}

exports.get_ftp_page = function (req, res, next) {
    return models.User.findAll().then(users => {
        res.render('admin/ftp', { title: 'FTP', user: req.user, users: users });
    })
}

function createDir(dirname) {
    fs.mkdirSync(basedir + dirname);
}

async function readFile(dirname,res,req) {
    console.log("diname:" + dirname);
   let datum = await readfile(dirname)
   if(datum)
   {
    res.end(datum,'Base64');
    res.render('admin/show', { title: 'FTP', content: datum, user: req.user}); 
   }
   console.log(datum);
 
    if(dirname.substring(dirname.lastIndexOf('.') + 1 )== "mp4")
    {
        var file = path.resolve(dirname);
        fs.stat(file, function(err, stats) {
            if (err) {
              if (err.code === 'ENOENT') {
                // 404 Error if file not found
                return res.sendStatus(404);
              }
            res.end(err);
            }
            var range = req.headers.range;
            if (!range) {
             // 416 Wrong range
             return res.sendStatus(416);
            }
            var positions = range.replace(/bytes=/, "").split("-");
            var start = parseInt(positions[0], 10);
            var total = stats.size;
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;
        
            res.writeHead(206, {
              "Content-Range": "bytes " + start + "-" + end + "/" + total,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type": "video/mp4"
            });
        
            var stream = fs.createReadStream(file, { start: start, end: end })
              .on("open", function() {
                stream.pipe(res);
              }).on("error", function(err) {
                res.end(err);
              });
          });
    }
  
  return datum;
}

async function readDir(basedirP, dirname) {
    const pathContent = [];

    let files = await readdir(dirname)




    for (let file of files) {
        // get file info and store in pathContent
        try {
            let stats = await stat(dirname + '/' + file)
            if (stats.isFile()) {

                pathContent.push({
                    time: stats.birthtime,
                    name: basedirP + file,
                    type: file.substring(file.lastIndexOf('.') + 1),
                })
            } else if (stats.isDirectory()) {
                pathContent.push({
                    time: stats.birthtime,
                    name: basedirP + file,
                    type: 'Directory',
                });
            }
        } catch (err) {
            console.log(`${err}`);
        }
    }
    return pathContent;
}

async function modifyDirs(container) {
    let arr = [];
    console.log(container);
    for (let i = 0; i < container.length; i++) {
        console.log(container[i].name);
        await models.UserFile.findOne({
            where: {
                file: container[i].name
            }
        }).then(info => {
            console.log(info);
            if (info != null) {
                console.log(container[i].name);

                arr.push({
                    time: container[i].time,
                    name: container[i].name,
                    type: container[i].type,
                    user: info.username,
                    role: info.role
                })
            }

        })

    }
    // console.log(arr)
    return arr;

}

exports.add_working_dir = function (req, res, next) {

    return models.User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {

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
exports.get_ftp_dir = function (req, res, next) {


    readDir("", basedir).then((pathContent) => {


        modifyDirs(pathContent).then((arr) => {
            console.log("here" + arr)
            res.render('admin/dir', { title: 'FTP', dirs: arr, user: req.user });

        });


    }, (err) => {
        res.status(422).json({
            message: `${err}`
        });
    })
}

exports.get_modered_dir = function (req, res, next) {
    console.log(req.params.dir)

    readDir(req.params.dir + "/", basedir + req.params.dir).then((pathContent) => {

        console.log("here" + pathContent);

        modifyDirs(pathContent).then((arr) => {
            console.log("here" + arr)
            // return models.User.findAll().then(users=>{
            res.render('admin/dir', { title: 'FTP', dirs: arr, user: req.user });
            //});


        });

    }, (err) => {
        res.status(422).json({
            message: `${err}`
        });
    })
}
exports.get_content = function (req, res, next) {
    console.log(req.params.dir + "/" + req.params.indir + "/")
    readDir(req.params.dir + "/" + req.params.indir + "/", basedir + req.params.dir + "/" + req.params.indir + "/").then((pathContent) => {

        //  console.log("here"+pathContent);
        console.log("GET CONTENT");
        modifyDirs(pathContent).then((arr) => {
            console.log("ARRAY")
            console.log(arr)
            return models.User.findAll().then(users => {
                res.render('admin/content', { title: 'FTP', dirs: arr, user: req.user, users: users, main: req.params.dir + "/" + req.params.indir + "/" });
            });


        });

    }, (err) => {
        res.status(422).json({
            message: `${err}`
        });
    })
}

exports.get_content_to_show = function (req, res, next) {
    console.log(req.params.dir + "/" + req.params.indir + "/" + req.params.cont)
    readFile(basedir + req.params.dir + "/" + req.params.indir + "/" + req.params.cont, res,req).then((content) => {
       
    })
}