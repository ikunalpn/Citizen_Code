const Addresser = require('../models/addresserModel');
const bcrypt = require('bcrypt');

const AddresserService = {
    register: (addresser, callback) => {
        bcrypt.hash(addresser.password, 10, (err, hash) => {
            if (err) return callback(err);
            addresser.password = hash;
            Addresser.create(addresser, callback);
        });
    },
    login: (email, password, callback) => {
        Addresser.findByEmail(email, (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback({ message: 'Addresser not found' });

            const user = results[0];
            bcrypt.compare(password, user.password, (bcryptErr, match) => {
                if (bcryptErr) return callback(bcryptErr);
                if (!match) return callback({ message: 'Incorrect password' });
                callback(null, user);
            });
        });
    },
    //... other methods
};

module.exports = AddresserService;