const e = require('express');
const fs = require('fs');
const multer = require('multer');
const File = require('../models/File');
const storagePath = './uploads';

//controller for getting all the files uploaded by a user
module.exports.getAllFilesForUser = (req, res) => {
    File.findAllFilesOfUser(req.userId)
        .then(([files, _])=>{
            console.log(files);
            res.render('dashboard', {
                files: files
            });
        })
        .catch(err =>{
            console.log(err);
            res.json({message: err.message, type: 'danger'});
        })
}

//controller for uploading a file
module.exports.addFile = (req, res) => {
    const newFile = new File(req.userId, req.file.originalname, req.file.size, req.file.mimetype, req.file.filename);
    newFile.save()
        .then((user)=>{
            console.log("File uploaded");
            let data =  {}
            data.message = {
                type: "success",
                message: "File uploaded successfully!"
            }
            res.redirect('/dashboard');
        })
        .catch(err =>{
            console.log(err);
            res.json({message: err.message, type: 'danger'});
        })
}

//controller for deleting a file
module.exports.deleteFile = (req, res) => {
    let fileId = req.params.id;
    File.find(fileId)
        .then(([files, _])=>{
            if(files.length > 0){
                let file = files[0];
                console.log("File", file);
                File.delete(fileId)
                    .then((result)=>{
                        let resultSetHeader = result[0];
                        if(resultSetHeader.affectedRows > 0){
                            const path = storagePath + '/' + file.destination_name;
                            fs.unlink(path, (err => {
                                if (err) {
                                    console.log(err);
                                    res.json({message: err.message, type: 'danger'});
                                }
                                else {
                                  console.log("File deleted successfully!");
                                  res.redirect('/dashboard');
                                }
                              }));
                        }
                        else{
                            res.json({message:'file does not exist', type: 'danger'});
                        }
                    })
                    .catch(err =>{
                        console.log(err);
                        res.json({message: err.message});
                    })
            }
            else{
                res.json({message:'file does not exist'});
            }
        })
        .catch(err =>{
            console.log(err);
            res.json({message: err.message, type: 'danger'});
        })
}

//controller for downloading a file
module.exports.downloadFile = (req, res) => {
    let fileId = req.params.id;
    File.find(fileId)
        .then(([files, _])=>{
            if(files.length > 0){
                let file = files[0];
                console.log("File", file);
                const path = storagePath + '/' + file.destination_name;
                const filename = file.destination_name;
            
                res.download(path, [filename], function(err) {
                    if(err) {
                        console.log(err);
                        res.json({message: err.message});
                    }
                    else{
                        console.log('download completed')
                    }
                })
            }
            else{
                res.json({message:'file does not exist', type: 'danger'});
            }
        })
        .catch(err =>{
            console.log(err);
            res.json({message: err.message, type: 'danger'});
        })
}

//controller for storing a file
module.exports.uploadFile = (req, res, next) => {
    const errors = [];

    var storage = multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, storagePath)
        },
        filename: function(req, file, cb){
            cb(null, req.userId + "_" +  Date.now() + "_" + file.originalname);
        }
    })
    
    const fileFilter = (req, file, cb) =>{
        console.log('file.mimetype', file.mimetype);
        if(file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
            cb(null,true);
        }
        else{
            cb(new Error('file should of type pdf, doc or xls'), false);
        }
    }

    const upload = multer({
        storage: storage,
        limits: {
             fileSize: 100 * 1000 * 1000 
            },
        fileFilter : fileFilter
    }).single("file");

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log('err', err);
            errors.push({message: err.message})
            res.render('add_file', {
                alerts: errors
            });            
        } else if (err) {
            console.log('unknown err', err);
            errors.push({message: err.message})
            res.render('add_file', {
                alerts: errors
            });  
        }
        else{
            next()
        }
    })
}