// require('dotenv').config()
// const chai = require('chai')
// const chaiHttp = require('chai-http')
// const jwt = require('jsonwebtoken')
// const jwtSecretKey = require('../src/util/config').secretkey
// const db = require('../src/dao/mysql-db')
// const server = require('../index')
// const logger = require('../src/util/logger')

// chai.should()
// chai.use(chaiHttp)

// const endpointToTest = '/api/user'

// // Queries to clear and populate test data
// const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
// const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
// const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
// const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

// const INSERT_USER = `
//     INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`)
//     VALUES (2, 'first', 'last', 'name@server.nl', 'secret', 'street', 'city');
// `

// const INSERT_MEALS = `
//     INSERT INTO \`meal\` (\`id\`, \`name\`, \`description\`, \`imageUrl\`, \`dateTime\`, \`maxAmountOfParticipants\`, \`price\`, \`cookId\`)
//     VALUES
//     (1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 2),
//     (2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 2);
// `

// // Before each test suite, clean and populate the database
// beforeEach((done) => {
//     db.getConnection((err, connection) => {
//         if (err) {
//             logger.error('Error connecting to database:', err)
//             done(err)
//             return
//         }

//         connection.query(CLEAR_DB, (err, results) => {
//             if (err) {
//                 logger.error('Error clearing database:', err)
//                 connection.release()
//                 done(err)
//                 return
//             }

//             // Insert the existing user into the database
//             const INSERT_EXISTING_USER = `
//                 INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`)
//                 VALUES (1, 'John', 'Doe', 'existing.user@example.com', 'Password123', 'Main Street', 'New York');
//             `

//             connection.query(INSERT_EXISTING_USER, (err, results) => {
//                 if (err) {
//                     logger.error('Error inserting existing user:', err)
//                     connection.release()
//                     done(err)
//                     return
//                 }

//                 connection.release()
//                 done()
//             })
//         })
//     })
// })

// describe('User Registration and Query API Tests', () => {
//     // UC-201: User Registration Tests

//     // TC-201-1: Missing Required Field
//     it('TC-201-1 should return 400 when a required field is missing', (done) => {
//         chai.request(server)
//             .post(endpointToTest)
//             .send({
//                 lastName: 'Doe',
//                 emailAdress: 'john.doe@example.com',
//                 password: 'Password123',
//                 phoneNumber: '06-12345678',
//                 street: 'Main Street',
//                 city: 'New York'
//                 // Missing firstName intentionally
//             })
//             .end((err, res) => {
//                 if (err) {
//                     console.error(err)
//                     done(err)
//                     return
//                 }

//                 res.should.have.status(400)
//                 res.body.should.be.an('object')
//                 res.body.should.have
//                     .property('message')
//                     .that.includes('Missing')
//                 res.body.should.have.property('data').that.is.empty
//                 done()
//             })
//     })

//     // TC-201-2: Invalid Email Address
//     it('TC-201-2 should return 400 when email address is invalid', (done) => {
//         chai.request(server)
//             .post(endpointToTest)
//             .send({
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 emailAdress: 'invalid_email',
//                 password: 'Password123',
//                 phoneNumber: '06-12345678',
//                 street: 'Main Street',
//                 city: 'New York'
//             })
//             .end((err, res) => {
//                 res.should.have.status(400)
//                 res.body.should.be.an('object')
//                 res.body.should.have
//                     .property('message')
//                     .that.includes('Invalid email address')
//                 res.body.should.have.property('data').that.is.empty
//                 done()
//             })
//     })

//     // TC-201-3: Invalid Password
//     it('TC-201-3 should return 400 when password is invalid', (done) => {
//         chai.request(server)
//             .post(endpointToTest)
//             .send({
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 emailAdress: 'john.doe@example.com',
//                 password: 'weakpass',
//                 phoneNumber: '06-12345678',
//                 street: 'Main Street',
//                 city: 'New York'
//             })
//             .end((err, res) => {
//                 res.should.have.status(400)
//                 res.body.should.be.an('object')
//                 res.body.should.have
//                     .property('message')
//                     .that.includes('Invalid password')
//                 res.body.should.have.property('data').that.is.empty
//                 done()
//             })
//     })

//     // TC-201-4: User Already Exists
//     it('TC-201-4 should return 403 when user already exists', (done) => {
//         chai.request(server)
//             .post(endpointToTest)
//             .send({
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 emailAdress: 'existing.user@example.com',
//                 password: 'Password123',
//                 phoneNumber: '06-12345678',
//                 street: 'Main Street',
//                 city: 'New York'
//             })
//             .end((err, res) => {
//                 res.should.have.status(403)
//                 res.body.should.be.an('object')
//                 res.body.should.have
//                     .property('message')
//                     .that.includes('User already exists')
//                 res.body.should.have.property('data').that.is.empty
//                 done()
//             })
//     })

//     // TC-201-5: Successful Registration
//     it('TC-201-5 should return 201 and user data when registration is successful', (done) => {
//         chai.request(server)
//             .post(endpointToTest)
//             .send({
//                 firstName: 'Jane',
//                 lastName: 'Smith',
//                 emailAdress: 'unique.email@example.com',
//                 password: 'StrongPassword123',
//                 phoneNumber: '06-87654321',
//                 street: 'Broadway',
//                 city: 'Los Angeles'
//             })
//             .end((err, res) => {
//                 if (err) {
//                     console.error(err)
//                     done(err)
//                     return
//                 }

//                 res.should.have.status(201)
//                 res.body.should.be.an('object')
//                 res.body.should.have
//                     .property('message')
//                     .that.includes('User registered successfully')
//                 res.body.should.have.property('data').that.is.an('object')
//                 done()
//             })
//     })
// })
