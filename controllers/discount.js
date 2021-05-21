const express = require('express');
const sha512 = require('js-sha512');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.get('/by-code', async (req, res) => {

    const {
        discountCode
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM discount WHERE "discountCode" = $1;`,
        [discountCode]
    );

    if (result.rows.length) {
        res.send(result.rows[0]);
        return;
    }if (result.rows.length) {
        for (let i = 0 ; i < result.rows.length ; ++i) {
            const withSeller = await pool.query(
                `SELECT * FROM seller WHERE "sellerId" = $1`,
                [result.rows[i].sellerId]
            )

            result.rows[i] = {
                ...result.rows[i],
                ...withSeller.rows[0]
            };
        }
    }

    res.send({
        error: 'not found'
    });
});

router.get('/promotion', async (req, res) => {

    const result = await pool.query(
        `SELECT * FROM discount WHERE ("discountType" = 'promotion' OR "discountType" = 'member-promotion') AND "discountStatus" = false;`
    );

    if (result.rows.length) {
        res.send(result.rows);
        return;
    }

    res.send({
        error: 'not found'
    });
});

router.get('/', async (req, res) => {

    const result = await pool.query(
        `SELECT * FROM discount;`
    );

    if (result.rows.length) {
        for (let i = 0 ; i < result.rows.length ; ++i) {
            const withSeller = await pool.query(
                `SELECT * FROM seller WHERE "sellerId" = $1`,
                [result.rows[i].sellerId]
            )

            result.rows[i] = {
                ...result.rows[i],
                ...withSeller.rows[0]
            };
        }
    }

    res.send(result.rows);
});

router.delete('/by-id', async (req, res) => {

    const {
        discountId
    } = req.body;

    await pool.query(
        `DELETE FROM discount WHERE "discountId" = $1;`,
        [discountId]
    );

    res.send({});
});

router.post('/', async (req, res) => {

    const {
        discountName,
        discountType,
        sellerId,
        productId,
        discountPrice,
        discountCode
    } = req.body;

    await pool.query(
        `INSERT INTO discount VALUES (nextval('SystemSerial'), $1, $2, $3, false, $4, $5, $6, now())`,
        [discountName, discountType, sellerId, productId, discountPrice, discountCode]
    );

    res.send({});
});

module.exports = router;