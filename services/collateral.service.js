const CollateralService = {
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
    }
};

module.exports = CollateralService;