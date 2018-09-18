var _DevMode = require('./setting');

const _CONFIG = {
    // DB_CON: {
    //     connectionLimit: 10,
    //     host: "localhost",
    //     user: 'root',
    //    // password: 'callog',// server
    //     password: '',
    //     database: 'callogdb'
    // }
    DB_CON: {
        connectionLimit: 10,
        host: "callogdbinstance.crafegk1pgtd.us-east-2.rds.amazonaws.com",
        user: 'callogdb',
        password: 'Shaheen4712',
        database: 'callogdb'
    },

    admin: {
        emial: "admin" // server
        //email: "yang@gmail.co" // test
    }
}

module.exports = _CONFIG;