const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//controller for registering user into database
module.exports.register = (req, res) => {
    //handle validation for form
    const errors = [];
    const {name, email, password, password2} = req.body;

    if(!name || !email || !password || !password2){
        errors.push({message: "All fileds are required"});
        console.log("all fields are required");
    }

    if(password !== password2){
        errors.push({message: "Password does not match"})
        console.log("Password does not match");
    }
    if(password < 8){
        errors.push({message: "Password length must be minimum 8"})
        console.log("Password length must be minimum 8");
    }

    //email validation
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!email.match(mailformat)){
        errors.push({message: "Invalid email "})
        console.log("Invalid email");
    }

    if(errors.length > 0){
        res.render('register', {
            alerts: errors
        })
    }
    else{
        //find user by emailid in database. If user found then send user already exist error else create a new user in db.
        User.findUserByEmail(email)
        .then((user)=>{
            if(user[0].length > 0){
                console.log(user[0])
                errors.push({message: "User already exists"})
                console.log("User already exists");
                res.render('register', {
                    alerts: errors
                });
            }
            else{
                const newUser = new User(name, email, password);
                bcrypt.genSalt(10, (err, salt)=>{
                    //hash password before saving into database
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        newUser.password = hash;
                        newUser.save()
                            .then((user)=>{
                                console.log("User created");
                                //generate jwt token
                                const token = createToken(newUser.userId)
                                //store the jwt in cookie
                                res.cookie("access-token", token);
                                res.redirect('/dashboard');
                            })
                            .catch(err =>{
                                errors.push({message: "Internal server error"})
                                console.log(err);
                                res.render('register', {
                                    alerts: errors
                                });
                            })
                    })
                })
            }
        })
        .catch(err =>{
            console.log(err);
            errors.push({message: "Internal server error"})
            res.render('register', {
                alerts: errors
            });
        })
    }
}

//controller for athenticating user
module.exports.login = (req, res) => {
    const {email, password} = req.body;
    const errors = [];

    User.findUserByEmail(email)
        .then((response)=>{
            let user = response[0][0];
            if(user){
                console.log(user);
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(isMatch){
                        //generate jwt token
                        const token = createToken(user.userId)
                        //store the jwt in cookie
                        res.cookie("access-token", token);
                        res.redirect('/dashboard');
                    }
                    else{
                        errors.push({message: "Incorrect password"})
                        console.log('incorrect password')
                        res.render('login', {
                            alerts: errors
                        })
                    }
                })
            }
            else{
                errors.push({message: "User does not exists"})
                console.log('User does not exists')
                res.render('login', {
                    alerts: errors
                })    
            }
        })    
        .catch(err =>{
            console.log(err);
            errors.push({message: "Internal server error"})
            res.render('login', {
                alerts: errors
            });
        })
}

//controller for logging out user
module.exports.logout = (req, res) => {
    res.cookie('access-token', ' ', { maxAge : 1 });
    res.redirect('/user/login');
}

//check if user is logged in
module.exports.loginRequired = (req, res, next)=>{
    //grab the token of user
    const token = req.cookies["access-token"];
    //check if token exists
    if(token){
        //verify the token
        const validToken = jwt.verify(token, "secretkey");
        if(validToken){
            req.userId = validToken.id;
            next();
        }
        else{
            res.redirect('/user/login');
        }
    }
    else{
        res.redirect('/user/login')
    }
}

//create jwt token
const createToken = (id)=>{
    return jwt.sign({id}, process.env.JWTSECRETKEY)
}