/*   
|*   NodeJS MySQL helper class by Albert Lourensen (83350)
|*   
|*   Dependencies:
|*   - mysql
|*   - dotenv
*/   

const mysql = require('mysql');
const dotenv = require('dotenv');

// environment variables from env file
dotenv.config();

let conn;

// connect to database
const connect = async () => {
    conn = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        database: process.env.DATABASE_NAME,
    })

    conn.connect(err => {
        if (err) {
            console.log()
            console.error('Unable to connect to MySQL database.')
            console.log()
            return
        } else {
            console.log()
            console.log('Connection to MySQL database established successfully.')
            console.log()
        }
    })
}

// query function
const query = async (sql) => {
    return new Promise((resolve, reject) => {
        conn.query(sql, (err, result) => {
            if (err) return reject(err)
            return resolve(result)
        })
    })
}

// database methods
const $ = {
    SURVEY: {
        GET_ALL: async () => {
            let result = await query(`SELECT * FROM surveys`)
            return result.length > 0 ? result : false
        },

        SEND: async (data) => {
            let result = await query(`INSERT INTO surveys (survey_token, question, answer) VALUES ('${data.token}', '${data.question}', '${data.answer}')`)
        },

        TRUNCATE: async () => {
            let result = await query('TRUNCATE TABLE surveys');
        }
    },
}

module.exports = {
    conn,
    connect,
    query,
    $
}