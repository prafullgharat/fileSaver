const express = require('express');
const router = express.Router();
const { loginRequired } = require('../controllers/authController');
const { getAllFilesForUser, uploadFile, addFile, deleteFile, downloadFile } = require('../controllers/fileController');

//route to index page
router.get('/', (req, res)=>{
    res.render('index');
})

//route to get all files uploaded by user 
router.get('/dashboard', loginRequired, getAllFilesForUser);

//route for upload file page
router.get('/add_file', loginRequired, (req, res) => {
    res.render('add_file', { alerts: [] });
})

//route to insert file details in db
router.post('/add_file', loginRequired, uploadFile, addFile);

//route to  delete a file 
router.get('/delete/:id', loginRequired, deleteFile);

//route to download a file 
router.get('/download/:id', loginRequired, downloadFile);

module.exports = router;