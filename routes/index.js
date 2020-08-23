var express = require('express');
var router = express.Router();
let main = require('../controllers/main');
let user = require('../controllers/user');
let {isLoggedIn, allowEdit, hasAuth} = require('../middleware/hasAuth.js');

/* GET home page. */
router.get('/', main.get_main_page);
router.get('/add', main.get_add_page);

/* POST user */

router.post('/add_user', main.add_user);

/*FTP */

router.get('/ftp', main.get_ftp_page);
router.post('/add_working_dir', main.add_working_dir);

router.get('/ftp_dir', main.get_ftp_dir);

router.get('/dirs/:dir', main.get_modered_dir);

/* AUTH */

router.get('/login', user.get_login_page);
router.post('/login', user.login);
router.post('/logout', hasAuth, user.logout);



module.exports = router;
