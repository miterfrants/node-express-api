const CryptographicHelper = require('../helpers/cryptographic.helper.js');
const JwtHelper = require('../helpers/jwt.helper.js');
const UsersService = {
    getOneByEmailAsync: async (connection, email) => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM users WHERE email='${email}'`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },
    createAsync: async (connection, email, password) => {
        const salt = CryptographicHelper.getSalt(32);
        const hash = CryptographicHelper.generateSaltedHash(password, salt);
        return new Promise((resolve, reject) => {
            connection.query(`INSERT INTO users (email, hash, salt) VALUE ('${email}', '${hash}', '${salt}');`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.affectedRows > 0) {
                        resolve(result.insertId);
                    } else {
                        reject('Insert Error');
                    }
                }
            });
        });
    },
    getTokenAsync: async (connection, email, password) => {
        const user = await UsersService.getOneByEmailAsync(connection, email);
        if (user.hash === CryptographicHelper.generateSaltedHash(password, user.salt)) {
            return await JwtHelper.generateToken(user.id, user.email);
        } else {
            return null;
        }
    },
    forgotPasswordAsync: async (connection, id) => {
        const resetToken = CryptographicHelper.getSalt(32);
        const resetTokenExpirationMinutes = Number(process.env.ResetTokenExpirationMinutes);
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE users SET 
                reset_token='${resetToken}',
                reset_token_expiration=DATE_ADD(NOW(),INTERVAL ${resetTokenExpirationMinutes} MINUTE) 
            WHERE id=${id}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    },
    resetPasswordAsync: async (connection, id, password) => {
        const salt = CryptographicHelper.getSalt(32);
        const hash = CryptographicHelper.generateSaltedHash(password, salt);
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE users SET 
                salt='${salt}',
                hash='${hash}'
            WHERE id=${id}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
};
module.exports = UsersService;