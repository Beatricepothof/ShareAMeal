// const chai = require('chai')
// const chaiHttp = require('chai-http')
// const app = require('../index.js') // Adjust the path based on your actual file structure
// const db = require('../src/dao/mysql-db')
// const logger = require('../src/util/logger')

// const expect = chai.expect

// chai.use(chaiHttp)

// const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
// const INSERT_USERS = `
//     INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`, \`isActive\`)
//     VALUES
//     (1, 'John', 'Doe', 'john@example.com', 'password1', 'Main Street', 'New York', true),
//     (2, 'Jane', 'Doe', 'jane@example.com', 'password2', 'Second Street', 'Los Angeles', false),
//     (3, 'Jim', 'Beam', 'jim@example.com', 'password3', 'Third Street', 'Chicago', true);
// `

// let token

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

//             connection.query(INSERT_USERS, (err, results) => {
//                 if (err) {
//                     logger.error('Error inserting users:', err)
//                     connection.release()
//                     done(err)
//                     return
//                 }

//                 connection.release()

//                 // Perform login to get token
//                 chai.request(app)
//                     .post('/api/login')
//                     .send({
//                         emailAdress: 'john@example.com',
//                         password: 'password1'
//                     })
//                     .end((err, res) => {
//                         if (err) {
//                             logger.error('Error logging in:', err)
//                             done(err)
//                             return
//                         }

//                         token = res.body.data.token // Store the token for use in tests
//                         done()
//                     })
//             })
//         })
//     })
// })

// describe('User Retrieval API Tests', () => {
//     // TC-202-1: Retrieve all users
//     it('TC-202-1 should return 200 and all users', (done) => {
//         chai.request(app)
//             .get('/api/user')
//             .set('Authorization', `Bearer ${token}`)
//             .end((err, res) => {
//                 if (err) {
//                     logger.error('Error in request:', err)
//                     done(err)
//                     return
//                 }
//                 expect(res).to.have.status(200)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 200)
//                 expect(res.body)
//                     .to.have.property('message')
//                     .that.includes('All users retrieved successfully')
//                 expect(res.body).to.have.property('data')
//                 done()
//             })
//     })

//     // TC-202-2: Search for users with a non-existing field
//     it('TC-202-2 should return 400 when searching with a non-existing field', (done) => {
//         chai.request(app)
//             .get('/api/user?firstName=Bla&lastName=Blabla')
//             .set('Authorization', `Bearer ${token}`)
//             .end((err, res) => {
//                 if (err) {
//                     logger.error('Error in request:', err)
//                     done(err)
//                     return
//                 }
//                 expect(res).to.have.status(200)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 200)
//                 expect(res.body)
//                     .to.have.property('message')
//                     .that.includes('No filtered users found.')
//                 expect(res.body).to.have.property('data')
//                 done()
//             })
//     })

//     // TC-202-3: Search for users with `isActive` set to `false`
//     it('TC-202-3 should return 200 and users with isActive set to false', (done) => {
//         chai.request(app)
//             .get('/api/user?isActive=false')
//             .set('Authorization', `Bearer ${token}`)
//             .end((err, res) => {
//                 if (err) {
//                     logger.error('Error in request:', err)
//                     done(err)
//                     return
//                 }
//                 expect(res).to.have.status(200)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 200)
//                 expect(res.body)
//                     .to.have.property('message')
//                     .and.includes('users')
//                 expect(res.body).to.have.property('data')
//                 done()
//             })
//     })

//     // TC-202-4: Search for users with `isActive` set to `true`
//     it('TC-202-4 should return 200 and users with isActive set to true', (done) => {
//         chai.request(app)
//             .get('/api/user?isActive=true')
//             .set('Authorization', `Bearer ${token}`)
//             .end((err, res) => {
//                 if (err) {
//                     logger.error('Error in request:', err)
//                     done(err)
//                     return
//                 }
//                 expect(res).to.have.status(200)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 200)
//                 expect(res.body)
//                     .to.have.property('message')
//                     .and.includes('users')
//                 expect(res.body).to.have.property('data')
//                 done()
//             })
//     })

//     // TC-202-5: Search for users with multiple filters on existing fields
//     it('TC-202-5 should return 200 and users matching multiple filters', (done) => {
//         chai.request(app)
//             .get('/api/user?firstName=John&isActive=true')
//             .set('Authorization', `Bearer ${token}`)
//             .end((err, res) => {
//                 if (err) {
//                     logger.error('Error in request:', err)
//                     done(err)
//                     return
//                 }
//                 expect(res).to.have.status(200)
//                 expect(res.body).to.be.an('object')
//                 expect(res.body).to.have.property('status', 200)
//                 expect(res.body).to.have.property('message')
//                 expect(res.body).to.have.property('data')
//                 done()
//             })
//     })
// })
