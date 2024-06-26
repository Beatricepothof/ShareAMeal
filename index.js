const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const mealRoutes = require('./src/routes/meal.routes')
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
app.use(authRoutes)
app.use(userRoutes)
app.use(mealRoutes)

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route could not be found',
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
