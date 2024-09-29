const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'smoketrees.db' )
let db

const initializeDbAndServer = async () => {
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/")
        })
    }catch(error){
        console.log(`${error.message}`)
        process.exit(1)
    }
}

initializeDbAndServer()

app.post("/register/", async (req, res) => {
    const {username, address} = req.body
    let userId
    const userQuery = `
        SELECT * 
        FROM User
        WHERE name = '${username}';
    `
    const userDetails = await db.get(userQuery)

    if (userDetails === undefined) {
        const insertUserQuery = `
            INSERT INTO User (name)
            VALUES ('${username}');
        `
        const userQuery = await db.run(insertUserQuery)
        userId = await userQuery.lastID
        console.log(userId)
    }else{
        userId = userDetails.id
    }

    const addAddressQuery = `
        INSERT INTO Address (user_id, address)
        VALUES (${userId}, '${address}');
    `

    const addAddress = await db.run(addAddressQuery)
    res.send("User registered and address added successfully")
})
