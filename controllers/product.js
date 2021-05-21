const express = require('express');
const sha512 = require('js-sha512');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.get('/', async (req, res) => {

    const result = await pool.query(
        `SELECT * FROM product;`
    );

    res.send(result.rows);
});

router.get('/by-id', async (req, res) => {

    const {
        productId
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM product WHERE "productId" = $1;`, 
        [productId]
    );

    if (result.rows.length) {
        res.send(result.rows[0]);
        return;
    }

    res.send({
        error: 'out of stock'
    });
});

router.get('/by-date-and-query', async (req, res) => {

    const {
        startDate,
        endDate,
        query
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM product WHERE "productDate" >= $1 AND "productDate" <= $2 AND "productName" LIKE $3;`,
        [startDate, endDate, '%' + query + '%']
    );

    res.send(result.rows);
});

router.delete('/by-id', async (req, res) => {

    const {
        productId
    } = req.body;

    await pool.query(
        `DELETE FROM product WHERE "productId" = $1;`,
        [productId]
    );

    res.send({});
});

router.post('/', async (req, res) => {

    const {
        productName,
        sellerId,
        productImageURL,
        productPrice,
        productStock,
        productCost,
        productPoint
    } = req.body;

    await pool.query(
        `INSERT INTO product VALUES(nextval('SystemSerial'), $1, $2, $3, $4, $5, $6, $7, 0, now());`,
        [sellerId, productName, productImageURL, productPrice, productStock, productCost, productPoint]
    );

    res.send({});
});

router.put('/', async (req, res) => {

    const {
        productId,
        productName,
        productImageURL,
        productPrice,
        productStock,
        productCost,
        productPoint
    } = req.body;

    await pool.query(
        `UPDATE product SET "productName" = $1, "productImageURL" = $2, "productPrice" = $3, "productStock" = $4, "productCost" = $5, "productPoint" = $6 WHERE "productId" = $7;`,
        [productName, productImageURL, productPrice, productStock, productCost, productPoint, productId]
    );

    res.send({});
});

module.exports = router;