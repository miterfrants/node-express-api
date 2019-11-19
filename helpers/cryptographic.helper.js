const crypto = require('crypto');
module.exports = {
    generateSaltedHash: (password, salt) => {
        var pass = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        return Buffer.from(pass).toString('base64');
    },
    getSalt: (length) => {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }
};