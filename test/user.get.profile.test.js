// const chai = require('chai')
// const chaiHttp = require('chai-http')
// const app = require('../index.js') // Adjust the path based on your actual file structure
// const db = require('../src/dao/mysql-db')
// const logger = require('../src/util/logger')

// const expect = chai.expect

// chai.use(chaiHttp)

// const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
// const INSERT_USER = `
//     INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`)
//     VALUES (1, 'John', 'Doe', 'test@example.com', 'correctpassword', 'Main Street', 'New York');
// `

// let validToken = ''

// beforeEach((done) => {
//     db.getConnection((err, connection) => {
//         if (err) {
//             logger.error('Error connecting to database:', err)
//             done(err)
//             return
//         }

//         connection.query(CLEAR_USERS_TABLE, (err, results) => {
//             if (err) {
//                 logger.error('Error clearing users table:', err)
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

//                 connection.release()
//                 // Generate or fetch a valid token for TC-203-2
//                 chai.request(app)
//                     .post('/api/login')
//                     .send({
//                         emailAdress: 'test@example.com',
//                         password: 'correctpassword'
//                     })
//                     .end((err, res) => {
//                         if (err) {
//                             logger.error('Error logging in user:', err)
//                             done(err)
//                             return
//                         }
//                         validToken = res.body.data.token // Capture the valid token for use
//                         done()
//                     })
//             })
//         })
//     })
// })

// describe('User Profile Retrieval API Tests', () => {
//     // TC-203-1: Invalid Token
//     it('TC-203-1 should return 401 with specific error message when token is invalid', (done) => {
//         chai.request(app)
//             .get('/api/user/profile')
//             .set('Authorization', 'Bearer invalidtoken')
//             .end((err, res) => {
//                 if (err) {
//                     logger.error('Error in request:', err)
//                     done(err)
//                     return
//                 }
//                 expect(res).to.have.status(401)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 401)
//                 expect(res.body)
//                     .to.have.property('message')
//                     .that.includes('Invalid token')
//                 expect(res.body).to.have.property('data').to.be.empty

//                 done()
//             })
//     })

//     // TC-203-2: User profile found
//     it('TC-203-2 should return 200 with specific success message and user data when user profile is found', (done) => {
//         chai.request(app)
//             .get('/api/user/profile')
//             .set('Authorization', `Bearer ${validToken}`)
//             .end((err, res) => {
//                 if (err) {
//                     logger.error('Error in request:', err)
//                     done(err)
//                     return
//                 }
//                 expect(res).to.have.status(200)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 200)
//                 expect(res.body).to.have.property(
//                     'message',
//                     'User profile retrieved successfully.'
//                 )
//                 expect(res.body).to.have.property('data')
//                 expect(res.body.data).to.be.an('object')
//                 expect(res.body.data).to.have.property('profile')
//                 expect(res.body.data.profile).to.be.an('object')
//                 expect(res.body.data.profile).to.have.property('id')
//                 expect(res.body.data.profile).to.have.property('firstName')
//                 expect(res.body.data.profile).to.have.property('lastName')
//                 expect(res.body.data.profile).to.have.property('emailAdress')

//                 done()
//             })
//     })
// })
