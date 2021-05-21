const express = require('express');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.get('/by-phone-number', async (req, res) => {

    const {
        userPhoneNumber
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM public.user WHERE "userPhoneNumber" = $1;`,
        [userPhoneNumber]
    );

    if (result.rows.length) {
        res.send(result.rows[0]);
        return;
    }

    res.send({
        error: 'not found'
    });
});

router.get('/by-id', async (req, res) => {

    const {
        userId
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM public.user WHERE "userId" = $1;`,
        [userId]
    );

    if (result.rows.length) {
        res.send(result.rows[0]);
        return;
    }

    res.send({
        error: 'not found'
    });
});

router.get('/by-query', async (req, res) => {

    const {
        query
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM public.user WHERE "userName" LIKE $1 OR "userSurname" LIKE $1 OR "userPhoneNumber" LIKE $1;`,
        ['%' + query + '%']
    );

    res.send(result.rows);
});

router.delete('/by-id', async (req, res) => {

    const {
        userId
    } = req.body;

    await pool.query(
        `DELETE FROM public.user WHERE "userId" = $1;`,
        [userId]
    );

    res.send({});
});

router.post('/', async (req, res) => {

    const {
        userName,
        userSurname,
        userPhoneNumber
    } = req.body;

    await pool.query(
        `INSERT INTO public.user VALUES(nextval('SystemSerial'), $1, $2, 0, $3, now());`,
        [userName, userSurname, userPhoneNumber]
    );

    res.send({});
});


router.put('/', async (req, res) => {

    const {
        userId,
        userName,
        userSurname,
        userPhoneNumber
    } = req.body;

    await pool.query(
        `UPDATE public.user SET "userName" = $2, "userSurname" = $3, "userPhoneNumber" = $4 WHERE "userId" = $1;`,
        [userId, userName, userSurname, userPhoneNumber]
    );

    res.send({});
});

module.exports = router;