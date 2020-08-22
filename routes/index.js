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



/* AUTH */

router.get('/login', user.get_login_page);
router.get('/logout', hasAuth, user.logout);



module.exports = router;
