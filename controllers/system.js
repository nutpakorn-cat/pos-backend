const express = require('express');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.get('/', async (req, res) => {

    const result = await pool.query(
        `SELECT * FROM system`
    );

    res.send(result.rows[0]);
});

router.patch('/', async (req, res) => {

    const {
        storeName,
        pointDiscountRate
    } = req.body;

    await pool.query(
        `UPDATE system SET "storeName" = $1, "pointDiscountRate" = $2;`,
        [storeName, pointDiscountRate]
    );
    
    res.send({});
});

module.exports = router;