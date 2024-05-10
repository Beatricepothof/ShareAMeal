//
// Onze lokale 'in memory database'.
// We simuleren een asynchrone database met een array van objecten.
// De array bevat een aantal dummy records.
// De database heeft twee methoden: get en add.
// Opdracht: Voeg de overige methoden toe.
//
const database = {
    // het array met dummy records. Dit is de 'database'.
    _data: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: 'van Dam',
            emailAdress: 'hvd@server.nl',
            password: 'test',
            isActive: true,
            street: 'Lovensdijkstraat 61',
            city: 'Breda',
            phoneNumber: '06 12312345',
            roles: []
        },
        {
            id: 1,
            firstName: 'Marieke',
            lastName: 'Jansen',
            emailAdress: 'm@server.nl',
            password: 'secret',
            isActive: true,
            street: 'Steendijk 40',
            city: 'Den Haag',
            phoneNumber: '06 54321234',
            roles: []
        }
    ],

    // Ieder nieuw item in db krijgt 'autoincrement' index.
    // Je moet die wel zelf toevoegen aan ieder nieuw item.
    _index: 2,
    _delayTime: 500,

    getAll(callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            // Roep de callback aan, en retourneer de data
            callback(null, this._data)
        }, this._delayTime)
    },

    getById(id, callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                callback({ message: `Error: id ${id} does not exist!` }, null)
            } else {
                callback(null, this._data[id])
            }
        }, this._delayTime)
    },

    add(item, callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            // Voeg een id toe en voeg het item toe aan de database
            item.id = this._index++
            // Voeg item toe aan de array
            this._data.push(item)

            // Roep de callback aan het einde van de operatie
            // met het toegevoegde item als argument, of null als er een fout is opgetreden
            callback(null, item)
        }, this._delayTime)
    },

    // Nieuwe functionaliteit: Update een bestaand item in de database
    update(id, newData, callback) {
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                callback({ message: `Error: id ${id} does not exist!` }, null)
            } else {
                // Vind het item in de array op basis van de id en update de gegevens
                this._data[id] = { ...this._data[id], ...newData }
                callback(null, this._data[id])
            }
        }, this._delayTime)
    },

    // Nieuwe functionaliteit: Verwijder een item uit de database op basis van de id
    remove(id, callback) {
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                callback({ message: `Error: id ${id} does not exist!` }, null)
            } else {
                // Verwijder het item uit de array op basis van de id
                const removedItem = this._data.splice(id, 1)[0]
                callback(null, removedItem)
            }
        }, this._delayTime)
    }
}

module.exports = database
// module.exports = database.index;
