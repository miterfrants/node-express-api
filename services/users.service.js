const CryptographicHelper = require('../helpers/cryptographic.helper.js');
const JwtHelper = require('../helpers/jwt.helper.js');
const UsersService = {
    getOneByEmailAsync: async (connection, email) => {
        return new Promise((resolve, reject) => {
            email = email.replace(/'/gi, '\\\'');
            connection.query(`SELECT * FROM users WHERE email='${email}' AND deleted_at is null`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },
    getRowNumAsync: async (connection, email, status) => {
        let filter = 'WHERE deleted_at is null';
        if (email) {
            email = email.replace(/'/gi, '\\\'');
            filter += ` AND email like '%${email}%'`;
        }
        if (status !== undefined && status !== null) {
            status = Number(status);
            if (isNaN(status)) {
                throw new Error('status should be integer');
            }
            filter += ` AND status=${status}`;
        }
        return new Promise((resolve, reject) => {
            connection.query(`SELECT COUNT(*) as count FROM users ${filter}`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });
    },
    getListAsync: async (connection, page, size, email, status) => {
        page = Number(page);
        size = Number(size);
        if (isNaN(page)) {
            throw new Error('page have to be type of integer');
        }
        if (isNaN(size)) {
            throw new Error('size have to be type of integer');
        }

        let filter = 'WHERE deleted_at is null';
        if (email) {
            email = email.replace(/'/gi, '\\\'');
            filter += ` AND email like '%${email}%'`;
        }
        if (status !== undefined && status !== null) {
            status = Number(status);
            if (isNaN(status)) {
                throw new Error('status should be integer');
            }
            filter += ` AND status=${status}`;
        }
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM users ${filter}
            ORDER BY id DESC LIMIT ${(page-1)*size}, ${size}`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },
    createAsync: async (connection, email, password) => {
        const salt = CryptographicHelper.getSalt(32);
        const hash = CryptographicHelper.generateSaltedHash(password, salt);
        return new Promise((resolve, reject) => {
            email = email.replace(/'/gi, '\\\'');
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
    getTokenAsync: async (connection, email, password, role) => {
        const user = await UsersService.getOneByEmailAsync(connection, email);
        if (user.hash === CryptographicHelper.generateSaltedHash(password, user.salt)) {
            return await JwtHelper.generateToken(user.id, user.email, role);
        } else {
            return null;
        }
    },
    updateStatus: async (connection, id, status) => {
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE users SET 
                status=${status}
            WHERE id=${id}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    },
    changeRole: async (connection, id, is_user_manager) => {
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE users SET 
                is_user_manager=${is_user_manager}
            WHERE id=${id}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
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
        id = Number(id);
        if (isNaN(id)) {
            throw new Error('id have be type of integer');
        }
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