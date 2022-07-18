const express = require('express');
const cookieparser = require('cookie-parser');
const dotev = require('dotenv');
dotev.config();
const {urlencoded} = require('express');
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');
const PORT = process.env.PORT || 4000;

// set up express app
const app = express();

app.use(urlencoded({extended : false}));
app.use(express.json());

//cookie parser
app.use(cookieparser());

// set template engine
app.set('view engine', 'ejs');

// initialize routes
app.use('/user', authRoutes);
app.use('/', fileRoutes);

// listen for requests
app.listen(PORT, () =>{
    console.log("server started");
})