const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Encrypting a password with bcrypt
let password = 'motdepasse!';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});

var hashedPassword = '$2a$10$cPawL0C7J9HjuMyODuU4o.hZx0Ybo02BZsKYnzj8oZ5N9lo.iMrsK';

bcrypt.compare(password, hashedPassword, (err, result) => {
    console.log(`Do they match?: ${result}`);
});

var someData = {
    id: 5
};

var token = jwt.sign(someData, '123abc');
console.log(token);

var decoded = jwt.verify(token, '123abc');
console.log(decoded);

var message = 'I am user number 1';
var hash = SHA256(message).toString();

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);

// Legit data from client
var data = {
    id: 4
};
var token = {
    data,
    hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
};

// Middleman hacks user id 
token.data.id = 5;
token.hash = SHA256(JSON.stringify(token.data)).toString();

// Logic creates hash of original data and salts it, therefore handling intrusion
var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
if(resultHash === token.hash) {
    console.log('Data was not changed');
} else {
    console.log('Data was changed. Do not trust!')
}