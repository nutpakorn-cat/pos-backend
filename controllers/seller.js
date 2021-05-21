const express = require('express');
const sha512 = require('js-sha512');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.get('/', async (req, res) => {

    const result = await pool.query(
        `SELECT * FROM seller;`
    );

    res.send(result.rows);
});

router.get('/by-id', async (req, res) => {

    const {
        sellerId
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM seller WHERE "sellerId" = $1;`,
        [sellerId]
    );

    res.send(result.rows[0]);
});

router.post('/', async (req, res) => {

    const {
        sellerUserName,
        sellerPassword,
        sellerName,
        sellerSurname,
        sellerPhoneNumber,
        permission
    } = req.body;

    await pool.query(
        `INSERT INTO seller VALUES (nextval('SystemSerial'), $1, $2, $3, $4, $5, $6)`,
        [sellerUserName, sha512(sellerPassword), sellerName, sellerSurname, sellerPhoneNumber, permission]
    );

    res.send({});
});

router.put('/', async (req, res) => {

    const {
        sellerId,
        sellerUserName,
        sellerPassword,
        sellerName,
        sellerSurname,
        sellerPhoneNumber,
        permission
    } = req.body;

    await pool.query(
        `UPDATE seller SET "sellerUserName" = $1, "sellerPassword" = $2, "sellerName" = $3, "sellerSurname" = $4, "sellerPhoneNumber" = $5, "permission" = $6 WHERE "sellerId" = $7;`,
        [sellerUserName, sha512(sellerPassword), sellerName, sellerSurname, sellerPhoneNumber, permission, sellerId]
    );

    res.send({});
});

router.patch('/password', async (req, res) => {

    const {
        sellerId,
        oldPassword,
        newPassword
    } = req.body;

    const result = await pool.query(
        `UPDATE seller SET "sellerPassword" = $1 WHERE "sellerId" = $2 AND "sellerPassword" = $3;`,
        [sha512(newPassword), sellerId, sha512(oldPassword)]
    );

    res.send({});
});

router.delete('/by-id', async (req, res) => {

    const {
        sellerId
    } = req.body;

    await pool.query(
        `DELETE FROM seller WHERE "sellerId" = $1;`,
        [sellerId]
    );

    res.send({});
});

module.exports = router;