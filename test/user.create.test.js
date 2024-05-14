const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('UC101 Inloggen', () => {
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    /**
     * Hier starten de testcases
     */

    // TC-101-1: Verplicht veld ontbreekt
    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                // emailAdress: 'emailAdress', ontbreekt
                password: 'password'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect emailAdress field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    // TC-101-2: Niet-valide wachtwoord
    it('TC-101-2 Niet-valide wachtwoord', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAdress: 'test@mail.com',
                password: 12345 // invalid password format
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(409)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('AssertionError: password must be a string.')
                chai.expect(res.body).not.to.have.property('data')

                done()
            })
    })

    // TC-101-3: Gebruiker bestaat niet
    it('TC-101-3 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAdress: 'nonexistent@mail.com',
                password: 'password123'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('User does not exist')
                chai.expect(res.body).not.to.have.property('data')

                done()
            })
    })

    // TC-101-4: Gebruiker succesvol ingelogd
    it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAdress: 'test@mail.com',
                password: 'password123'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .that.is.a('string')
                chai.expect(res.body.data)
                    .to.have.property('token')
                    .that.is.a('string')

                done()
            })
    })
})
