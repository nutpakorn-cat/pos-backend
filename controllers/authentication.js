const express = require('express');
const sha512 = require('js-sha512');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.post('/', async (req, res) => {

    const {
        username,
        password
    } = req.body;

    const result = await pool.query(`SELECT * FROM seller WHERE "sellerUserName" = $1 AND "sellerPassword" = $2;`, [username, sha512(password)]);

    if (result.rows.length) {
        res.send({
            loginData: true,
            sellerId: result.rows[0].sellerId,
            permission: result.rows[0].permission
        });
        return;
    }

    res.send({
        error: 'not found'
    });
});


module.exports = router;