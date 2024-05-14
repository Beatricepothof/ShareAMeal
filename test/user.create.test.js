const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('UC201 Registreren als nieuwe user', () => {
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
    // TC-201-1: Verplicht veld ontbreekt
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    // TC-201-2: Niet-valide emailadres
    it('TC-201-2 Niet-valide emailadres', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'ongeldig.email',
                password: '123456'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Invalid email adress')
                chai.expect(res.body).not.to.have.property('data')

                done()
            })
    })

    // TC-201-3: Niet-valide wachtwoord
    it('TC-201-3 Niet-valide wachtwoord', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'test.mail@server.nl',
                password: 'short'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Invalid password')
                chai.expect(res.body).not.to.have.property('data')

                done()
            })
    })

    // TC-201-4: Gebruiker bestaat al
    it('TC-201-4 Gebruiker bestaat al', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Marieke',
                lastName: 'Jansen',
                emailAdress: 'm@server.nl',
                password: '123456'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('User already exists')
                chai.expect(res.body).not.to.have.property('data')

                done()
            })
    })

    // TC-201-5: Gebruiker succesvol geregistreerd
    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl',
                password: '123456'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(201)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('User successfully registered')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.an('object')
                chai.expect(res.body.data)
                    .to.have.property('id')
                    .that.is.a('number')
                chai.expect(res.body.data)
                    .to.have.property('firstName')
                    .equals('Voornaam')
                chai.expect(res.body.data)
                    .to.have.property('lastName')
                    .equals('Achternaam')
                chai.expect(res.body.data)
                    .to.have.property('emailAdress')
                    .equals('v.a@server.nl')

                done()
            })
    })
})
