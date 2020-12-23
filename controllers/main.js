let models = require("../models");
let bcrypt = require("bcrypt");

let flash = require('connect-flash');
const { isEmpty } = require('lodash');
const { promisify } = require('util')
const { validateUser } = require('../validators/add');
const ftp = require("basic-ftp");
const fs = require('fs');
let dir;
let client = new ftp.Client();

let basedir = "/";




var multer = require('multer');
const { connect } = require("http2");
const { Stream } = require("stream");


let generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

async function clientAuth(host, port, user, password) {
    client = new ftp.Client();
    console.log(host);
    console.log(port);
    console.log(user);
    console.log(password);
    //  client.ftp.verbose = true
    try {
        console.log(client)
        await client.access({
            host: host,
            port: port,
            user: user,
            password: password,
            secure: false,
            // secureOptions : secureOptions
        })
        console.log("************LIST OF CLIENTS FILES********");
        await client.ensureDir(basedir)
        return client;
    } catch (err) {

        console.error(err)
    }
    client.close()
    return null;
}


exports.get_main_page = async function(req, res, next) {

    basedir = "/";
    if (req.user) {
        // client = clientAuth(req.user.username, req.user.password, req.user.role);
        client = new ftp.Client();
        let host = req.user.host;
        let port = req.user.port;
        let user = req.user.log;
        let password = req.user.pswd;
        console.log(host);
        console.log(port);
        console.log(user);
        console.log(password);
        client = await clientAuth(host, port, user, password);
        if (!client) {
            console.log("SYNC FAILED");
            res.render('index', { error: " Синхронизация прервана. Проверьте наличие FTP-сервера по адресу " + host + " и порту " + port });
    
        } else {
            console.log("connected");
            console.log(client);
            console.log("HERE IS BASEDIR");
            console.log(basedir);
            await client.list(basedir, (err, res) => {
                if (err) {
                    req.flash('host', "Error to connect")
                    res.redirect('/');
                    return;
                }
                console.log(res);
    
            });
            req.flash('host', host + ':' + port)
            let message = req.flash('host');
            res.render('index', { title: 'CMS', user: req.user, connect: message[0] });
        }
       
    } else {
        models.Role.findAll().then(roles => {

            if (roles.length == 0) {
                let add = require('./FillRoleTable.js');
                add.addRoles();
            }
        });

        res.render('index', { title: 'CMS', user: req.user, connect: false });
    }


}


exports.get_add_page = function(req, res, next) {
    basedir = "/";
    models.Role.findAll().then(roles => {
        res.render('admin/add', { title: 'Add User', formData: {}, errors: {}, roles: roles, user: req.user });
    });
}


const rerender = function(errors, req, res, next) {
    models.Role.findAll().then(roles => {
        res.render('admin/add', { title: 'Add User', formData: req.body, errors: errors, roles: roles, user: req.user });
    });
}

exports.add_user = function(req, res, next) {
    basedir = "/";
    let errors = {};
    return validateUser(errors, req).then(errors => {
        if (!isEmpty(errors)) {
            rerender(errors, req, res, next);
        } else {
            let newUser = models.User.build({
                username: req.body.username,
                password: generateHash(req.body.password),
                role: req.body.role,
                host: req.body.host,
                port: req.body.port,
                log: req.body.log,
                pswd: req.body.pswd,
                basedir: req.body.based
            });

            return newUser.save().then(result => {
                res.redirect("/add");
            })
        }
    });
}


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        console.log(basedir + "/" + file.originalname);

        callback(null, basedir + "/" + req.params.indir);
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});

var upload = multer({ storage: storage }).single('file');


exports.post_files = async function(req, res, next) {
    console.log(req.body)
    let reslts = await client.uploadFrom(req.body.file, req.body.basedir).then(reslt => {
        console.log("************RESULTED STREAM*********")
        console.log(reslt)
        console.log("************RESULTED STREAM END*********")
        let UserFile = models.UserFile.build({
            username: req.body.username,
            role: req.user.role,
            file: req.body.basedir + "/" + req.file.filename
        });

        return UserFile.save().then(result => {
            res.redirect('/dirs/' + req.body.basedir);

        })
    });

    uploadFrom(req.file, req.body.basedir).then(reslt => {

        res.status(200).json({ message: `File uploaded to FTP` });
    });



    // upload(req, res, function (err) {

    //     //console.log("owen",req.file,err);
    //     if (err) {
    //         console.log(err);
    //         console.log("file is NOT uploaded");
    //     }
    //     else {
    //         if (req.file) {
    //             let UserFile = models.UserFile.build({
    //                 username: req.body.username,
    //                 role: req.user.role,
    //                 file: req.params.dir + "/" + req.params.indir + "/" + req.file.filename
    //             });

    //             return UserFile.save().then(result => {
    //                 res.redirect('/dirs/' + req.params.dir + "/" + req.params.indir);

    //             })
    //         }


    //     }
    // });
}

exports.get_ftp_page = function(req, res, next) {
    basedir = "/";
    return models.User.findAll().then(users => {
        basedir=users.basedir;
            res.render('admin/ftp', { title: 'FTP', user: req.user, users: users, basedir: basedir });
    })
}

// function createDir(dirname) {
//     fs.mkdirSync(basedir + dirname);
// }


exports.add_working_dir = function(req, res, next) {

    models.User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {

        // client.features().then(reslt=>{
        //     console.log(reslt)
        // });

        client.send(`MKD ${req.body.file}`).then(result => {
            console.log(result)
            let UserFile = models.UserFile.build({
                username: req.body.username,
                role: user.role,
                file: req.body.file
            });

            return UserFile.save().then(result => {
                res.redirect("/ftp");
            })
        });
        //createDir(req.body.file);

    });

}
exports.get_ftp_dir = async function(req, res, next) {

    basedir=req.user.basedir;
    try{
        
      let dirs = await client.list(basedir, (err, reslts) => {
        if (err) {
            res.status(422).json({
                message: `${err}`
            });
        }
        return reslts;

    });
    if (dirs) {
        //console.log(dirs);
        let dir_desc = [];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            if (dir.type != 2) {
                let type = dir.name.toString().split('.');

               // console.log(type[1])
                dir_desc.push({ type: type[1], dir: dir });
            } else {
                console.log(basedir+dir.name);

               let temp_files= await client.list(basedir+dir.name, (err, reslts) => {
                    if (err) {
                        res.status(422).json({
                            message: `${err}`
                        });
                    }
                    return reslts;
                });
                let json_file;
                if(temp_files)
                {
                
                    for (let j = 0; j < temp_files.length; j++) {
                        let in_dir=temp_files[j];
                        if(in_dir!=null&&in_dir!=2)
                        {
                        
                            let type = in_dir.name.toString().split('.');            
                            if(type[0]=='description'&&type[1]=="json")
                            {
                                let reslts = await client.downloadTo("./temp/" + in_dir.name, basedir+dir.name+ "/" + in_dir.name).then(reslt => {
                                    console.log("************RESULTED STREAM*********")
                                    console.log(reslt)
                                    console.log("************RESULTED STREAM END*********")
                
                                    json_file = JSON.parse(fs.readFileSync('./temp/' +in_dir.name).toString());
                                  
                                        fs.unlink('./temp/' + in_dir.name, (err) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("FILE DELETED");
                                            }
                                        })
                                
                                });
                               
                            }
                        }
                        
                    }
                   
                }
                if(json_file)
                {
                    console.log(json_file)
                    console.log("IN PUSHING JSON")
                    dir_desc.push({ type: "dir", dir: dir, json: json_file });
                }
                else{
                    dir_desc.push({ type: "dir", dir: dir });
                }
               

              

            }

        }
        //console.log(dir_desc)
        res.render('admin/dir', { title: 'FTP', basedir: basedir, dirs: dir_desc, user: req.user });
    }
} catch (error) {
    res.render('admin/dir', { title: 'FTP', basedir: basedir, error:error});
}

}

exports.get_modered_dir = async function(req, res, next) {
    console.log(basedir);
    basedir += req.params.dir + "/";
    console.log(basedir);
    try {
        let dirs = await client.list(basedir, (err, reslts) => {
            if (err) {
                res.status(422).json({
                    message: `${err}`
                });
            }
    
            return reslts;
    
        });
        console.log("get_modered_dir")
        console.log(dirs);
        if (dirs) {
    
            console.log(dirs);
            let dir_desc = [];
            for (let i = 0; i < dirs.length; i++) {
                const dir = dirs[i];
                if (dir.type != 2) {
                    let type = dir.name.toString().split('.');
    
                    console.log(type[1])
                    dir_desc.push({ type: type[1], dir: dir });
                } else {
                    console.log(basedir+dir.name);
    
                    let temp_files= await client.list(basedir+dir.name, (err, reslts) => {
                         if (err) {
                             res.status(422).json({
                                 message: `${err}`
                             });
                         }
                         return reslts;
                     });
                     let json_file;
                     if(temp_files)
                     {
                     
                         for (let j = 0; j < temp_files.length; j++) {
                             let in_dir=temp_files[j];
                             if(in_dir!=null&&in_dir!=2)
                             {
                             
                                 let type = in_dir.name.toString().split('.');            
                                 if(type[0]=='description'&&type[1]=="json")
                                 {
                                     let reslts = await client.downloadTo("./temp/" + in_dir.name, basedir+dir.name+ "/" + in_dir.name).then(reslt => {
                                         console.log("************RESULTED STREAM*********")
                                         console.log(reslt)
                                         console.log("************RESULTED STREAM END*********")
                     
                                         json_file = JSON.parse(fs.readFileSync('./temp/' +in_dir.name).toString());
                                       
                                             fs.unlink('./temp/' + in_dir.name, (err) => {
                                                 if (err) {
                                                     console.log(err);
                                                 } else {
                                                     console.log("FILE DELETED");
                                                 }
                                             })
                                     
                                     });
                                    
                                 }
                             }
                             
                         }
                        
                     }
                     if(json_file)
                     {
                         console.log(json_file)
                         console.log("IN PUSHING JSON")
                         dir_desc.push({ type: "dir", dir: dir, json: json_file });
                     }
                     else{
                         dir_desc.push({ type: "dir", dir: dir });
                     }
                    
     
                   
     
    
                }
    
            }
            console.log(dir_desc)
            res.render('admin/dir', { title: 'FTP', basedir: basedir, dirs: dir_desc, user: req.user });
        }
    } catch (error) {
        res.render('admin/dir', { title: 'FTP', basedir: basedir, error:error});
    }
    
}

exports.get_content_to_show = async function(req, res, next) {
try{
    let dirs = await client.list(basedir, (err, reslts) => {
        if (err) {
            res.status(422).json({
                message: `${err}`
            });
        }

        return reslts;

    });
    console.log("get_modered_dir")
    console.log(dirs);
    if (dirs) {
        let find = false;
        for (let i = 0; i < dirs.length; i++) {
            const element = dirs[i];
            if (element.name == req.body.dirname) {
                find = true;
            }
        }
        if (find) {

            let reslts = await client.downloadTo("./temp/" + req.body.dirname, basedir + "/" + req.body.dirname).then(reslt => {
                console.log("************RESULTED STREAM*********")
                console.log(reslt)
                console.log("************RESULTED STREAM END*********")

                let file = req.body.dirname;
                let type = file.toString().split('.');
                let data;
                console.log(type[1])
                if (type[1] == 'txt') {
                    data = fs.readFileSync('./temp/' + req.body.dirname, "utf8", (err, data) => {
                        if (err) {
                            res.status(404).send(err);

                        }
                        return data;

                    })
                    if (data) {
                        console.log(data)
                            // res.status(200).json({ data: data });
                        fs.unlink('./temp/' + req.body.dirname, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("FILE DELETED");
                            }
                        })
                        res.status(200).json({ data: data, type: 'txt', filename: req.body.dirname });

                    }
                } else if (type[1] == 'json') {
                    data = JSON.parse(fs.readFileSync('./temp/' + req.body.dirname).toString());
                    if (data) {
                        console.log(data)
                            // res.status(200).json({ data: data });
                        fs.unlink('./temp/' + req.body.dirname, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("FILE DELETED");
                            }
                        })
                        res.status(200).json({ data: data, type: 'json', filename: req.body.dirname });

                    }
                } else {
                    data = fs.readFileSync('./temp/' + req.body.dirname, "base64", (err, data) => {
                        if (err) {
                            res.status(404).send(err);

                        }
                        return data;

                    })
                    if (data) {
                        res.status(200).json({ data: data, type: type[1], ending: type[1], filename: req.body.dirname });
                        fs.unlink('./temp/' + req.body.dirname, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("FILE DELETED");
                            }
                        })
                    }
                }

            });
        } else {
            fs.writeFileSync('description.json', `{"description":"Описание"}`);

            client.uploadFrom('./description.json', basedir + "/description.json").then(reslt => {
                fs.unlink('description.json', (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("FILE DELETED");
                    }
                })
                res.status(200).json({ data: `{"description":"Описание"}`, type: 'json', filename: "description.json" });
            });


        }

    }

} catch (error) {
    res.render('admin/dir', { title: 'FTP', basedir: basedir, error:error});
}


    // This will wait until we know the readable stream is actually valid before piping   
}

exports.json_save = async function(req, res, next) {
    let str = JSON.stringify(req.body.json_data).toString();
    console.log(str)
    fs.writeFileSync('description.json', str);

    client.uploadFrom('./description.json', req.body.basedir + "/description.json").then(reslt => {
        fs.unlink('description.json', (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("FILE DELETED");
            }
        })
        res.status(200).json({ message: `Description ${req.body.json_data.data } added` });
    });
}


const passport = require('passport');
const myPassport = require('../passport_setup')(passport);



exports.get_login_page = function(req, res, next) {
    res.render('auth/login', { formData: {}, errors: {} });
}


exports.login = function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next)
}

exports.logout = function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
    client = new ftp.Client();
}