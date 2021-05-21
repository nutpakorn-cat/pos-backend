const Pool = require('pg').Pool;
module.exports = new Pool({
    user: 'ttykqcvvqqjrwc',
    host: 'ec2-52-5-247-46.compute-1.amazonaws.com',
    database: 'd1i9afbroco3hm',
    password: 'ea4b34c1dbbab6fc99875026dbc407c80a8a4b9446fa52503ced97fc0e0ab239',
    port: 5432,
    ssl: true
});