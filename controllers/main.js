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

    console.log(host);
    console.log(port);
    console.log(user);
    console.log(password);
    client.ftp.verbose = true
    try {
        //     const secureOptions = {
        //   // Necessary only if the server requires client certificate authentication.
        //   key: fs.readFileSync('client-key.pem'),
        //   cert: fs.readFileSync('client-cert.pem'),

        //   // Necessary only if the server uses a self-signed certificate.
        //   ca: [ fs.readFileSync('server-cert.pem') ],

        //   // Necessary only if the server's cert isn't for "localhost".
        //   checkServerIdentity: () => { return null; },
        // };

        await client.access({
                host: host,
                port: port,
                user: user,
                password: password,
                secure: false,
                // secureOptions : secureOptions
            })
            // await client.ensureDir("/my/remote/directory")
        console.log("************LIST OF CLIENTS FILES********");
        await client.ensureDir(basedir)
        console.log(await client.list())

        // client.trackProgress(info => {
        //     console.log(info)
        //     console.log("*************")
        //     console.log("File", info.name)
        //     console.log("Type", info.type)
        //     console.log("Transferred", info.bytes)
        //     console.log("Transferred Overall", info.bytesOverall)
        // })

        // await client.uploadFrom("temp/readme.txt", "readme.txt")
        // await client.downloadTo("README_COPY.md", "README_FTP.md")
        return client;
    } catch (err) {

        console.error(err)
    }
    client.close()
    return null;
}

exports.chose_ftp = async function(req, res, next) {
    let host = req.body.host;
    let port = req.body.port;
    let user = req.body.user;
    let password = req.body.password;
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
            //     // Prints something like
            //     // -rw-r--r--   1 sergi    staff           4 Jun 03 09:32 testfile1.txt
            //     // -rw-r--r--   1 sergi    staff           4 Jun 03 09:31 testfile2.txt
            //     // -rw-r--r--   1 sergi    staff           0 May 29 13:05 testfile3.txt
            //     // ...
        });
        req.flash('host', host + ':' + port)
        res.redirect('/');
    }

}

exports.get_main_page = function(req, res, next) {

    basedir = "/";
    if (req.user) {
        // client = clientAuth(req.user.username, req.user.password, req.user.role);
        console.log("HERE IS BASEDIR");
        console.log(basedir);
        if (client.)
            client.list(basedir, (err, reslt) => {
                if (err) {
                    req.flash('host', "Error to connect")
                    res.redirect('/');
                    return;
                } else {

                }
                console.log(reslt);
                //     // Prints something like
                //     // -rw-r--r--   1 sergi    staff           4 Jun 03 09:32 testfile1.txt
                //     // -rw-r--r--   1 sergi    staff           4 Jun 03 09:31 testfile2.txt
                //     // -rw-r--r--   1 sergi    staff           0 May 29 13:05 testfile3.txt
                //     // ...
            });
        let message = req.flash('host');
        res.render('index', { title: 'CMS', user: req.user, connect: message[0] });
    }
    models.Role.findAll().then(roles => {

        if (roles.length == 0) {
            let add = require('./FillRoleTable.js');
            add.addRoles();
        }
    });

    res.render('index', { title: 'CMS', user: req.user, connect: false });



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
    //                 file: req.body.basedir+"/"+req.file.filename
    //             });

    //             return UserFile.save().then(result => {
    //                 res.redirect('/dirs/' + req.body.basedir);

    //             })
    //         }


    //     }
    // });
}

exports.get_ftp_page = function(req, res, next) {
    basedir = "/";
    return models.User.findAll().then(users => {
        res.render('admin/ftp', { title: 'FTP', user: req.user, users: users, basedir: basedir });
    })
}

function createDir(dirname) {
    fs.mkdirSync(basedir + dirname);
}


exports.add_working_dir = function(req, res, next) {

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
exports.get_ftp_dir = async function(req, res, next) {
    let dirs = await client.list(basedir, (err, reslts) => {
        if (err) {
            res.status(422).json({
                message: `${err}`
            });
        }
        return reslts;

    });
    if (dirs) {
        console.log(dirs);
        res.render('admin/dir', { title: 'FTP', dirs: dirs, user: req.user, basedir: basedir });
    }


}

exports.get_modered_dir = async function(req, res, next) {
    console.log(basedir);
    basedir += "/" + req.params.dir;
    console.log(basedir);
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
        res.render('admin/dir', { title: 'FTP', dirs: dirs, user: req.user, basedir: basedir });
    }
}

exports.get_content_to_show = async function(req, res, next) {


    let reslts = await client.downloadTo("./temp/" + req.body.dirname, basedir + "/" + req.body.dirname).then(reslt => {
        console.log("************RESULTED STREAM*********")
        console.log(reslt)
        console.log("************RESULTED STREAM END*********")


    });
    console.log("HERE")

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
    } else if (type[1] == 'mp4') {
        let readStream = fs.createReadStream('./temp/' + req.params.cont, 'base64');
        readStream.on('data', (chunk) => {
            data += chunk;
        }).on('end', () => {
            //res.status(200).json({ data: data });
            readStream.pipe(res);
            res.status(200).json({ data: data, type: 'txt', filename: req.body.dirname });
        })


        fs.unlink('./temp/' + req.body.dirname, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("FILE DELETED");
            }
        })
    } else {
        data = fs.readFileSync('./temp/' + req.body.dirname, "base64", (err, data) => {
            if (err) {
                res.status(404).send(err);

            }
            return data;

        })
        if (data) {
            res.status(200).json({ data: data, type: 'other', ending: type[1], filename: req.body.dirname });
            fs.unlink('./temp/' + req.body.dirname, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("FILE DELETED");
                }
            })
        }
    }





    // This will wait until we know the readable stream is actually valid before piping   
}