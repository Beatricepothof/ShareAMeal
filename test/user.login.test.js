// const chai = require('chai')
// const chaiHttp = require('chai-http')
// const app = require('../index.js') // Adjust the path based on your actual file structure
// const db = require('../src/dao/mysql-db')
// const logger = require('../src/util/logger')

// const expect = chai.expect

// chai.use(chaiHttp)

// /**
//  * Db queries to clear and fill the test database before each test.
//  */
// const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
// const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
// const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
// const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

// /**
//  * Voeg een user toe aan de database. Deze user heeft id 1.
//  * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
//  */
// const INSERT_USER =
//     'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
//     '(2, "first", "last", "name@server.nl", "secret", "street", "city");'

// /**
//  * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
//  * met een bestaande user in de database.
//  */
// const INSERT_MEALS =
//     'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
//     "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
//     "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

// beforeEach((done) => {
//     db.getConnection((err, connection) => {
//         if (err) {
//             logger.error('Error connecting to database:', err)
//             done(err)
//             return
//         }

//         connection.query(CLEAR_MEAL_TABLE, (err) => {
//             if (err) {
//                 logger.error('Error clearing meals table:', err)
//                 connection.release()
//                 done(err)
//                 return
//             }

//             connection.query(CLEAR_USERS_TABLE, (err) => {
//                 if (err) {
//                     logger.error('Error clearing users table:', err)
//                     connection.release()
//                     done(err)
//                     return
//                 }

//                 connection.query(INSERT_USER, (err) => {
//                     connection.release()
//                     if (err) {
//                         logger.error('Error inserting user:', err)
//                         done(err)
//                         return
//                     }

//                     done()
//                 })
//             })
//         })
//     })
// })

// describe('User Login', () => {
//     describe('UC-101 Inloggen', () => {
//         it('TC-101-1 Verplicht veld ontbreekt', (done) => {
//             chai.request(app)
//                 .post('/api/login')
//                 .send({
//                     // email is missing
//                     password: 'somepassword'
//                 })
//                 .end((err, res) => {
//                     expect(res).to.have.status(400)
//                     expect(res.body).to.be.a('object')
//                     expect(res.body)
//                         .to.have.property('message')
//                         .eql(
//                             'AssertionError [ERR_ASSERTION]: email must be a string.'
//                         )
//                     expect(res.body).to.have.property('data').eql({})
//                     done()
//                 })
//         })

//         it('TC-101-2 Invalid password', function (done) {
//             chai.request(baseUrl)
//                 .post('/api/login')
//                 .send({ email: 'user@example.com', password: 'wrongpassword' })
//                 .end((err, res) => {
//                     expect(res).to.have.status(400)
//                     expect(res.body)
//                         .to.have.property('message')
//                         .that.includes('Invalid password.')
//                     expect(res.body).to.have.property('data').that.is.empty
//                     done()
//                 })
//         })

//         it('TC-101-3 Gebruiker bestaat niet', (done) => {
//             chai.request(app)
//                 .post('/api/login')
//                 .send({
//                     email: 'nonexistentuser@example.com',
//                     password: 'somepassword'
//                 })
//                 .end((err, res) => {
//                     expect(res).to.have.status(404)
//                     expect(res.body).to.be.a('object')
//                     expect(res.body)
//                         .to.have.property('message')
//                         .eql('User not found')
//                     expect(res.body).to.have.property('data').eql({})
//                     done()
//                 })
//         })

//         it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
//             chai.request(app)
//                 .post('/api/login')
//                 .send({
//                     email: 'test@example.com',
//                     password: 'correctpassword'
//                 })
//                 .end((err, res) => {
//                     expect(res).to.have.status(200)
//                     expect(res.body).to.be.a('object')
//                     expect(res.body)
//                         .to.have.property('message')
//                         .eql('Login successful')
//                     expect(res.body)
//                         .to.have.property('data')
//                         .to.be.an('object')
//                         .that.includes.keys('user', 'token')
//                     expect(res.body.data.user).to.include.keys(
//                         'id',
//                         'firstName',
//                         'lastName',
//                         'emailAdress'
//                     )
//                     done()
//                 })
//         })
//     })
// })
