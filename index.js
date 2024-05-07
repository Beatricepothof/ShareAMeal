const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const logger = require('./src/util/logger')

const app = express()
const database = require('./src/dao/inmem-db.js')

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())

const port = process.env.PORT || 3000

// Dit is een voorbeeld van een simpele route
app.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        name: 'My Nodejs Express server',
        version: '0.0.1',
        description: 'This is a simple Nodejs Express server'
    }
    res.json(info)
})

// Dit is een test van een simpele route
app.get('/api/test', (req, res) => {
    console.log('GET /api/test')
    const test = {
        name: 'My Nodejs test test test',
        version: '0.0.1',
        description: 'This is a simple test'
    }
    res.json(test)
})

// Hier komen alle routes
// UC-201: Registering as a new user
app.post('/api/user', (req, res) => {
    const newUser = req.body
    console.log('POST /api/user', newUser)

    database.add(newUser, (error, addedUser) => {
        if (error) {
            console.error('Error adding user:', error)
            return res.status(500).json({ error: 'Failed to add user' })
        }
        console.log('User added successfully:', addedUser)
        res.status(201).json({ status: 201, result: addedUser })
    })
})

// UC-202: Retrieve overview of users
app.get('/api/user', (req, res) => {
    console.log('GET /api/user')
    const user = {
        name: 'All users',
        version: '0.0.1',
        description: 'This is a list of all users'
    }
    res.json(user)
})

// UC-203: Retrieve user profile by id
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId
    let user = database.find((user) => user.id == userId)
    if (user.length > 0) {
        console.log(user)
        res.status(200).json({
            status: 200,
            result: user
        })
    } else {
        res.status(404).json({
            status: 404,
            message: 'User not found'
        })
    }
})

// UC-205: Modify user data
app.put('/api/user/profile', (req, res) => {
    // Logic to modify user's own data
})

// UC-206: Delete user
app.delete('/api/user/profile', (req, res) => {
    // Logic to delete user's own account
})

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
})

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    })
})

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
})

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app
