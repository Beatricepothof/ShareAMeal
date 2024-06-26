// const chai = require('chai')
// const chaiHttp = require('chai-http')
// const app = require('../index.js') // Adjust the path based on your actual file structure
// const db = require('../src/dao/mysql-db')
// const logger = require('../src/util/logger')

// const expect = chai.expect

// chai.use(chaiHttp)

// const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
// const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
// const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'

// const CLEAR_DB = `${CLEAR_MEAL_TABLE} ${CLEAR_PARTICIPANTS_TABLE} ${CLEAR_USERS_TABLE}`

// const INSERT_USER =
//     'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
//     '(2, "first", "last", "name@server.nl", "secret", "street", "city");'

// const INSERT_MEALS =
//     'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
//     "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 2)," +
//     "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 2);"

// let validToken = ''

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

//             connection.query(INSERT_USER, (err, results) => {
//                 if (err) {
//                     logger.error('Error inserting user:', err)
//                     connection.release()
//                     done(err)
//                     return
//                 }

//                 connection.query(INSERT_MEALS, (err, results) => {
//                     if (err) {
//                         logger.error('Error inserting meals:', err)
//                         connection.release()
//                         done(err)
//                         return
//                     }

//                     connection.release()
//                     // Generate or fetch a valid token for user ID 2
//                     chai.request(app)
//                         .post('/api/login')
//                         .send({
//                             emailAdress: 'name@server.nl',
//                             password: 'secret'
//                         })
//                         .end((err, res) => {
//                             if (err) {
//                                 logger.error('Error logging in user:', err)
//                                 done(err)
//                                 return
//                             }
//                             validToken = res.body.data.token // Capture the valid token for use
//                             done()
//                         })
//                 })
//             })
//         })
//     })
// })

// describe('Meal Addition API Tests', () => {
//     // TC-301-1: Required field missing (400)
//     it('TC-301-1 should return 400 when a required field is missing', (done) => {
//         chai.request(app)
//             .post('/api/meal')
//             .set('Authorization', `Bearer ${validToken}`)
//             .send({
//                 isActive: 1,
//                 isVega: 0,
//                 isVegan: 0,
//                 isToTakeHome: 1,
//                 dateTime: '2022-03-22 17:35:00',
//                 maxAmountOfParticipants: 4,
//                 price: '10.00',
//                 imageUrl:
//                     'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
//                 cookId: 2, // Ensure this matches the correct cookId in your database setup
//                 createDate: '2022-03-22 17:35:00',
//                 updateDate: '2022-03-22 17:35:00',
//                 // Missing name field
//                 description:
//                     'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
//                 allergenes: 'gluten,lactose'
//             })
//             .end((err, res) => {
//                 expect(res).to.have.status(400)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 400)
//                 expect(res.body).to.have.property(
//                     'message',
//                     'Missing or incorrect name field'
//                 )
//                 expect(res.body).to.have.property('data').to.be.empty
//                 done()
//             })
//     })

//     // TC-301-2: Not logged in (401)
//     it('TC-301-2 should return 401 when user is not logged in', (done) => {
//         chai.request(app)
//             .post('/api/meal')
//             // No Authorization header set
//             .send({
//                 // Send valid meal data here
//             })
//             .end((err, res) => {
//                 expect(res).to.have.status(401)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 401)
//                 expect(res.body).to.have.property(
//                     'message',
//                     'Unauthorized! Log in to get access.'
//                 )
//                 expect(res.body).to.have.property('data').to.be.empty
//                 done()
//             })
//     })

//     // TC-301-3: Meal successfully added (201)
//     it('TC-301-3 should return 201 with specific success message when meal is successfully added', (done) => {
//         chai.request(app)
//             .post('/api/meal')
//             .set('Authorization', `Bearer ${validToken}`)
//             .send({
//                 isActive: 1,
//                 isVega: 0,
//                 isVegan: 0,
//                 isToTakeHome: 1,
//                 dateTime: '2022-03-22 17:35:00',
//                 maxAmountOfParticipants: 4,
//                 price: '10.00',
//                 imageUrl:
//                     'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
//                 cookId: 2, // Ensure this matches the correct cookId in your database setup
//                 createDate: '2022-03-22 17:35:00',
//                 updateDate: '2022-03-22 17:35:00',
//                 name: 'Tosti Wow',
//                 description:
//                     'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
//                 allergenes: 'gluten,lactose'
//             })
//             .end((err, res) => {
//                 expect(res).to.have.status(201)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 201)
//                 expect(res.body).to.have.property(
//                     'message',
//                     'Meal successfully added'
//                 )
//                 expect(res.body).to.have.property('data').to.be.an('object')
//                 // Optionally, validate the returned meal data structure if needed
//                 done()
//             })
//     })
// })
