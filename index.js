const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const logger = require('./src/util/logger')
const validateUserCreate = require('./src/routes/user.routes.js')

const app = express()
const database = require('./src/dao/inmem-db.js')
const authRoutes = require('./src/routes/authentication.routes').routes

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
// UC-201: Registreren als nieuwe user
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

// UC-202: Opvragen van overzicht van users
app.get('/api/user', (req, res) => {
    console.log('GET /api/user')
    database.getAll((error, allUsers) => {
        if (error) {
            console.error('Error getting all users:', error)
            return res.status(500).json({ error: 'Failed to retrieve users' })
        }
        console.log('All users retrieved successfully:', allUsers)
        res.status(200).json({ status: 200, result: allUsers })
    })
})

// UC-204: Opvragen van user op basis van ID
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId
    console.log(`GET /api/user/${userId}`)

    // Call the 'getById' method of your in-memory database
    database.getById(userId, (error, user) => {
        if (error) {
            // Handle error
            console.error(`Error getting user with id ${userId}:`, error)
            return res.status(500).json({ error: 'Failed to retrieve user' })
        }
        if (!user) {
            // User not found
            console.log(`User with id ${userId} not found`)
            return res
                .status(404)
                .json({ error: `User with id ${userId} not found` })
        }
        // User retrieved successfully
        console.log(`User with id ${userId} retrieved successfully:`, user)
        res.status(200).json({ status: 200, result: user })
    })
})

// UC-205: Wijzigen van usergegevens
app.put('/api/user/:userId', (req, res) => {
    const userId = req.params.userId
    const newData = req.body
    console.log(`PUT /api/user/:userId/${userId}`, newData)

    database.update(userId, newData, (error, updatedUser) => {
        if (error) {
            // Handle error
            console.error(`Error updating user with id ${userId}:`, error)
            return res.status(500).json({ error: 'Failed to update user' })
        }
        if (!updatedUser) {
            // User not found
            console.log(`User with id ${userId} not found`)
            return res
                .status(404)
                .json({ error: `User with id ${userId} not found` })
        }
        // User updated successfully
        console.log(`User with id ${userId} updated successfully:`, updatedUser)
        res.status(200).json({ status: 200, result: updatedUser })
    })
})

// UC-206: Verwijderen van user
app.delete('/api/user/:userId', (req, res) => {
    const userIdToDelete = req.params.userId

    // Call the 'delete' method of your in-memory database
    database.remove(userIdToDelete, (error, deletedUser) => {
        if (error) {
            // Handle error
            console.error(
                `Error deleting user with id ${userIdToDelete}:`,
                error
            )
            return res.status(500).json({ error: 'Failed to delete user' })
        }
        if (!deletedUser) {
            // User not found
            console.log(`User with id ${userIdToDelete} not found`)
            return res
                .status(404)
                .json({ error: `User with id ${userIdToDelete} not found` })
        }
        // User deleted successfully
        console.log(`User with id ${userIdToDelete} deleted successfully`)
        res.status(200).json({
            status: 200,
            message: `User with id ${userIdToDelete} deleted successfully`
        })
    })
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
