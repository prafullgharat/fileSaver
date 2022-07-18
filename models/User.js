const db  = require('../config/db'); 
const uuid = require('uuid');

class User{
    constructor(name, email, password){
        this.name = name,
        this.email = email,
        this.password = password,
        this.userId = uuid.v1()
    }

    save(){
        const sql = `INSERT INTO users(userId, name, email, password)VALUES('${this.userId}', '${this.name}', '${this.email}', '${this.password}')`;
        return db.execute(sql);
    }

    static findUserByEmail(email){
        const sql = `SELECT * FROM users WHERE email = '${email}'`;
        return db.execute(sql);
    }
}

module.exports = User;