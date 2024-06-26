require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
const db = require('../src/dao/mysql-db')
const app = require('../index')
const logger = require('../src/util/logger')

const expect = chai.expect

chai.use(chaiHttp)

/**
 * SQL Queries to clear and populate the database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = `${CLEAR_MEAL_TABLE} ${CLEAR_PARTICIPANTS_TABLE} ${CLEAR_USERS_TABLE}`

/**
 * Insert a user into the database.
 */
const INSERT_USER = `
    INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`, \`phoneNumber\`)
    VALUES (1, 'John', 'Doe', 'test@example.com', 'correctpassword', 'Main Street', 'New York', '+123456789');
`

let validToken = ''

beforeEach((done) => {
    db.getConnection((err, connection) => {
        if (err) {
            logger.error('Error connecting to database:', err)
            done(err)
            return
        }

        connection.query(CLEAR_DB, (err, results) => {
            if (err) {
                logger.error('Error clearing database:', err)
                connection.release()
                done(err)
                return
            }

            connection.query(INSERT_USER, (err, results) => {
                if (err) {
                    logger.error('Error inserting user:', err)
                    connection.release()
                    done(err)
                    return
                }

                connection.release()

                chai.request(app)
                    .post('/api/login')
                    .send({
                        emailAdress: 'test@example.com',
                        password: 'correctpassword'
                    })
                    .end((err, res) => {
                        if (err) {
                            logger.error('Error logging in user:', err)
                            done(err)
                            return
                        }
                        validToken = res.body.data.token
                        done()
                    })
            })
        })
    })
})

describe('Meal Addition API Tests', () => {
    it('TC-301-1 should return 400 when a required field is missing', (done) => {
        chai.request(app)
            .post('/api/meal')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                isActive: 1,
                isVega: 0,
                isVegan: 0,
                isToTakeHome: 1,
                dateTime: '2022-03-22 17:35:00',
                maxAmountOfParticipants: 4,
                price: '10.00',
                imageUrl:
                    'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                cookId: 1,
                createDate: '2022-03-22 17:35:00',
                updateDate: '2022-03-22 17:35:00',
                // Missing name field
                description:
                    'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
                allergenes: 'gluten,lactose'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Missing or incorrect name field')
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    it('TC-301-2 should return 401 when user is not logged in', (done) => {
        chai.request(app)
            .post('/api/meal')

            .send({
                name: 'New Meal',
                description: 'Delicious new meal',
                dateTime: '2024-06-26 15:32:15',
                maxAmountOfParticipants: 5,
                price: 10.0,
                imageUrl: 'https://example.com/image.jpg',
                cookId: 1
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 401)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Unauthorized! Log in to get access.')
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    it('TC-301-3 should return 201 with specific success message when meal is successfully added', (done) => {
        chai.request(app)
            .post('/api/meal')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'New Meal',
                description: 'Delicious new meal',
                dateTime: '2024-06-26 15:32:15',
                maxAmountOfParticipants: 5,
                price: 10.0,
                imageUrl: 'https://example.com/image.jpg',
                cookId: 1
            })
            .end((err, res) => {
                expect(res).to.have.status(201)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 201)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Meal successfully added')
                expect(res.body).to.have.property('data').to.be.an('object')
                done()
            })
    })
})
