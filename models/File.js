const db  = require('../config/db'); 

class File{
    constructor(userId, fileName, size, mimetype, destinationName){
        this.userId = userId,
        this.fileName = fileName,
        this.size = size,
        this.destinationName = destinationName,
        this.mimetype = mimetype
    }

    save(){
        let type;

        if(this.mimetype === 'application/pdf'){
            type = 'pdf'
        }
        else if(this.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
            type = 'doc'
        }
        else if(this.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
            type = 'xls'
        }

        const createdDate = new Date().toISOString()
        const status = 'created';

        const sql = `INSERT INTO files(userId, file_name, status, type, size, destination_name, created_at)VALUES('${this.userId}', '${this.fileName}', '${status}', '${type}', '${this.size}','${this.destinationName}', '${createdDate}')`;
        console.log(sql);
        return db.execute(sql);
    }

    static find(fileId){
        const sql = `SELECT * FROM files WHERE fileId = ${fileId}`;
        return db.execute(sql);
    }

    static findAll(){
        const sql = 'SELECT * FROM files';
        return db.execute(sql);
    }

    static findAllFilesOfUser(userId){
        const sql = `SELECT * FROM files WHERE userId = '${userId}' AND status = 'created'`;
        return db.execute(sql);
    }

    static delete(fileId){
        const status = 'deleted';
        const deletedAt = new Date().toISOString()
        const sql = `UPDATE files SET status = '${status}', deleted_at = '${deletedAt}' WHERE fileId = ${fileId}`;
        return db.execute(sql);
    }

}

module.exports = File;