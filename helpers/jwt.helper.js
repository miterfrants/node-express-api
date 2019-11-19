const jwt = require('jsonwebtoken');
module.exports = {
    validToken: (token) => {
        try {
            return jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return null;
        }
    },
    generateToken: (id, email) => {
        return new Promise((resolve, reject) => {
            jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30 * process.env.JwtExpirationMonth),
                sub: id,
                email: email
            }, process.env.JWT_KEY, {
                algorithm: 'HS512'
            }, (error, token) => {
                if (error) {
                    reject(error);
                }
                resolve(token);
            });
        });
    }
};