const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');


//route for login page
router.get('/login', (req, res)=>{
    res.render('login', { alerts: [] });
})

//route for athenticating user
router.post('/login', login);

//route for register page
router.get('/register', (req, res)=>{
    res.render('register', { alerts: [] });
})

//route for registering user into database
router.post('/register', register);

//route for logging out
router.get('/logout', logout);

module.exports = router;