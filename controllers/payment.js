const express = require('express');
const sha512 = require('js-sha512');
const router = express.Router();

const pool = require('./../lib/connect-postgresql');

router.get('/by-date', async (req, res) => {
    
    const {
        startDate,
        endDate
    } = req.query;

    const result = await pool.query(
        `SELECT * FROM payment WHERE "paymentDate" >= $1 AND "paymentDate" <= $2;`,
        [startDate, endDate]
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
})

router.post('/', async (req, res) => {

    const {
        sellerId,
        cartList,
        discountList,
        userId,
        usePoint
    } = req.body;

    let sum = 0;
    let totalDiscount = 0;
    let addPoint = 0;
    let userData;

    cartList.forEach((each) => {
        sum += each.productPrice * each.quantity;
        addPoint += each.productPoint * each.quantity;
    });

    if (userId != null) {
        const user = await pool.query(
            `SELECT * FROM public.user WHERE "userId" = $1;`,
            [userId]
        );

        userData = user.rows[0];
    }

    if (usePoint) {
        const system = await pool.query(
            `SELECT * FROM system;`
        );

        sum -= userData.userPoint * system.rows[0].pointDiscountRate;
        totalDiscount += userData.userPoint * system.rows[0].pointDiscountRate;

        await pool.query(
            `UPDATE public.user SET "userPoint" = 0 WHERE "userId" = $1;`,
            [userId]
        );
    }

    discountList.forEach((each) => {
        if (each.discountType == 'money') {
            sum -= each.discountPrice;
        } else if (each.discountType == 'promotion') {
            cartList.forEach((eachProduct) => {
                if (eachProduct.productId == each.productId) {
                    sum -= eachProduct.quantity * each.discountPrice;
                    totalDiscount += eachProduct.quantity * each.discountPrice;
                }
            });
        } else if (userId != null) {
            cartList.forEach((eachProduct) => {
                if (eachProduct.productId == each.productId) {
                    sum -= eachProduct.quantity * each.discountPrice;
                    totalDiscount += eachProduct.quantity * each.discountPrice;
                }
            });
        }
    });

    const system = await pool.query(
        `SELECT * FROM system;`
    );

    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();

    doc.addFont("Prompt.ttf", "Prompt", "normal");
    doc.setFont("Prompt");

    doc.text('ใบเสร็จ', 70, 20);
    doc.text('ร้าน ' + system.rows[0].storeName, 70, 30);

    doc.text('=================', 70, 50);
    doc.text('รายการสินค้า', 80, 60);
    doc.text('=================', 70, 70);

    let i = 80;

    cartList.forEach((each) => {
        doc.text(each.productName + ' x' + each.quantity + ' รวม ' + (each.productPrice * each.quantity).toFixed(2) + ' บาท', 70, i);
        i += 10;
    });
    i += 10;
    if (userId != null) {
        
        doc.text('คุณ ' + userData.userName + ' ' + userData.userSurname, 70, i);
        i += 10;
        doc.text('แต้มสมาชิก ' + (userData.userPoint + addPoint) + ' แต้ม ได้รับแต้มเพิ่มขึ้น +' + addPoint + ' แต้ม', 70, i);
        i += 10;
        i += 10;
    }

    doc.text('ส่วนลดทั้งหมด ' + totalDiscount.toFixed(2) + ' บาท', 70, i);
    i += 10;
    doc.text('ยอดรวมที่ต้องชำระ ' + sum.toFixed(2) + ' บาท', 60, i);

    const pdfName = Date.now() + '_' + Math.floor(Math.random() * 100000) + '.pdf';
    doc.save("output/payment/" + pdfName);

    const pdfURL = req.protocol + '://' + req.get('host') + '/payment/' + pdfName;

    let userName = 'ไม่เป็นสมาชิก';
    let userSurname = '';

    if (userId != null) {
       userName = userData.userName;
       userSurname = userData.userSurname;

       await pool.query(
           `UPDATE public.user SET "userPoint" = "userPoint" + $1 WHERE "userId" = $2;`,
           [addPoint, userId]
       );
    }

    const result = await pool.query(
        `INSERT INTO payment VALUES (nextval('SystemSerial'), '${userName}', '${userSurname}', now(), '${pdfURL}', '${sellerId}', ${sum}, now());`
    );

    cartList.forEach(async (each) => {
        await pool.query(
            `UPDATE product SET "productStock" = "productStock" - ${each.quantity} WHERE "productId" = $1;`,
            [each.productId]
        );
    })

    res.send({
        paymentId: result,
        paymentTotalPrice: sum,
        paymentReceipt: pdfURL
    });
});


module.exports = router;