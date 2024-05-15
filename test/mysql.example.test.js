// process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
// process.env.LOGLEVEL = 'trace'

// const chai = require('chai')
// const chaiHttp = require('chai-http')
// const assert = require('assert')
// const jwt = require('jsonwebtoken')
// const jwtSecretKey = require('../src/util/config').secretkey
// const db = require('../src/dao/mysql-db')
// const server = require('../index')
// const logger = require('../src/util/logger')
// require('dotenv').config()

// chai.should()
// chai.use(chaiHttp)

// const endpointToTest = '/api/user'

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

// describe('Example MySql testcase', () => {
//     //
//     // informatie over before, after, beforeEach, afterEach:
//     // https://mochajs.org/#hooks
//     //
//     before((done) => {
//         logger.debug(
//             'before: hier zorg je eventueel dat de precondities correct zijn'
//         )
//         logger.debug('before done')
//         done()
//     })

//     describe('UC201 Registreren als nieuwe user', () => {
//         /**
//          * Voorbeeld van een beforeEach functie.
//          * Hiermee kun je code hergebruiken of initialiseren.
//          */
//         beforeEach((done) => {
//             console.log('Before each test')
//             done()
//         })

//         /**
//          * Hier starten de testcases
//          */
//         // TC-201-1: Verplicht veld ontbreekt
//         it('TC-201-1 Verplicht veld ontbreekt', (done) => {
//             chai.request(server)
//                 .post(endpointToTest)
//                 .send({
//                     // firstName: 'Voornaam', ontbreekt
//                     lastName: 'Achternaam',
//                     emailAdress: 'v.a@server.nl'
//                 })
//                 .end((err, res) => {
//                     chai.expect(res).to.have.status(400)
//                     chai.expect(res.body).to.be.a('object')
//                     chai.expect(res.body).to.have.property('status').equals(400)
//                     chai.expect(res.body)
//                         .to.have.property('message')
//                         .equals('Missing or incorrect firstName field')
//                     chai
//                         .expect(res.body)
//                         .to.have.property('data')
//                         .that.is.a('object').that.is.empty

//                     done()
//                 })
//         })

//         // TC-201-2: Niet-valide emailadres
//         it('TC-201-2 Niet-valide emailadres', (done) => {
//             chai.request(server)
//                 .post(endpointToTest)
//                 .send({
//                     firstName: 'Voornaam',
//                     lastName: 'Achternaam',
//                     emailAdress: 'ongeldig.email',
//                     password: '123456'
//                 })
//                 .end((err, res) => {
//                     chai.expect(res).to.have.status(400)
//                     chai.expect(res.body).to.be.a('object')
//                     chai.expect(res.body)
//                         .to.have.property('message')
//                         .equals('Invalid email address')
//                     chai.expect(res.body).not.to.have.property('data')

//                     done()
//                 })
//         })

//         // TC-201-3: Niet-valide wachtwoord
//         it('TC-201-3 Niet-valide wachtwoord', (done) => {
//             chai.request(server)
//                 .post(endpointToTest)
//                 .send({
//                     firstName: 'Voornaam',
//                     lastName: 'Achternaam',
//                     emailAdress: 'test.mail@server.nl',
//                     password: 'short'
//                 })
//                 .end((err, res) => {
//                     chai.expect(res).to.have.status(400)
//                     chai.expect(res.body).to.be.a('object')
//                     chai.expect(res.body)
//                         .to.have.property('message')
//                         .that.is.a('string')
//                         .contains('Missing or incorrect password field')
//                     chai.expect(res.body).not.to.have.property('data')

//                     done()
//                 })
//         })

//         // TC-201-4: Gebruiker bestaat al
//         it('TC-201-4 Gebruiker bestaat al', (done) => {
//             chai.request(server)
//                 .post(endpointToTest)
//                 .send({
//                     firstName: 'Marieke',
//                     lastName: 'Jansen',
//                     emailAdress: 'm@server.nl',
//                     password: '123456'
//                 })
//                 .end((err, res) => {
//                     chai.expect(res).to.have.status(403)
//                     chai.expect(res.body).to.be.a('object')
//                     chai.expect(res.body)
//                         .to.have.property('message')
//                         .that.is.a('string')
//                         .contains('User already exists')
//                     chai.expect(res.body).not.to.have.property('data')

//                     done()
//                 })
//         })

//         // TC-201-5: Gebruiker succesvol geregistreerd
//         it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
//             chai.request(server)
//                 .post(endpointToTest)
//                 .send({
//                     firstName: 'Voornaam',
//                     lastName: 'Achternaam',
//                     emailAdress: 'v.a@server.nl'
//                 })
//                 .end((err, res) => {
//                     res.should.have.status(201)
//                     res.body.should.be.a('object')

//                     res.body.should.have.property('data').that.is.a('object')
//                     res.body.should.have.property('message').that.is.a('string')

//                     const data = res.body.data
//                     data.should.have.property('firstName').equals('Voornaam')
//                     data.should.have.property('lastName').equals('Achternaam')
//                     data.should.have.property('emailAdress')
//                     data.should.have.property('id').that.is.a('number')

//                     done()
//                 })
//         })
//     })
// })
