const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/output'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/authentication', require('./controllers/authentication'));
app.use('/discount', require('./controllers/discount'));
app.use('/payment', require('./controllers/payment'));
app.use('/product', require('./controllers/product'));
app.use('/report', require('./controllers/report'));
app.use('/user', require('./controllers/user'));
app.use('/system', require('./controllers/system'));
app.use('/seller', require('./controllers/seller'));

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});