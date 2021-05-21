const express = require('express');
const sha512 = require('js-sha512');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.get('/by-date', async (req, res) => {

    const {
        startDate
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM report WHERE "reportDate" = $1 ORDER BY "reportCreatedDate" DESC;`,
        [startDate]
    );

    if (result.rows.length) {
        res.send(result.rows[0]);
        return;
    }

    res.send({});
});

router.post('/', async (req, res) => {

    const {
        sellerId,
        startDate
    } = req.body;

    const system = await pool.query(
        `SELECT * FROM system;`
    );

    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();

    doc.addFont("Prompt.ttf", "Prompt", "normal");
    doc.setFont("Prompt");

    doc.text('รายงาน ประจำวันที่ ' + startDate, 70, 20);
    doc.text('ร้าน ' + system.rows[0].storeName, 70, 30);

    let i = 40;

    const paymentOnDay = await pool.query(
        `SELECT * FROM payment WHERE "paymentDate" = $1;`,
        [startDate]
    );

    let sum = 0;
    let min = 1000;
    let max = 0;

    paymentOnDay.rows.forEach((each) => {
        if (each.paymentTotalPrice > max)
            max = each.paymentTotalPrice;

        if (each.paymentTotalPrice < min) {
            min = each.paymentTotalPrice;
        }
        sum += each.paymentTotalPrice;
    });
    i += 10;
    doc.text('ขายได้ ' + paymentOnDay.rows.length + ' การขาย', 70, i);
    i += 10;
    doc.text('ขายได้ราคาน้อยที่สุด ' + min.toFixed(2) + ' บาท', 70, i);
    i += 10;
    doc.text('ขายได้ราคาสูงที่สุด ' + max.toFixed(2) + ' บาท', 70, i);
    i += 10;
    i += 10;
    doc.text('ยอดรวม: ' + sum.toFixed(2) + ' บาท', 70, i);

    const pdfName = Date.now() + '_' + Math.floor(Math.random() * 100000) + '.pdf';
    doc.save("output/report/" + pdfName);

    const pdfURL = req.protocol + '://' + req.get('host') + '/report/' + pdfName;

    await pool.query(
        `INSERT INTO report VALUES(nextval('SystemSerial'), $1, $2, $3, now());`,
        [pdfURL, sellerId, startDate]
    );

    res.send({});
});

module.exports = router;