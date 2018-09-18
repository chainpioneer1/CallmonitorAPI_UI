var bcrypt = require('bcrypt');
var pool = require('../database');
var _CONFIG = require('../config');

const saltRounds = 10;

exports.index = function (req, res, next) {
    res.send({
        message: "starting"
    })
}

exports.login = async function (req, res, next) {
    try {
        var password_hash = req.body.password;
        let user = await pool.query('select * from employer where username=?', req.body.email);
        if (!(user && user.length > 0)) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user && user.length > 0) {
            // encrpted password compare
            let password = user[0].password_hash.toString();
            password = password.replace(/^\$2y(.+)$/i, '$2a$1')
            let matchpassword = await bcrypt.compare(password_hash, password);

            if (!(matchpassword === true)) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                return;
            } else {
                if (user[0].username === _CONFIG.admin.email) {
                    res.json({
                        success: true,
                        user: user[0],
                        isAdmin: true
                    });
                } else {
                    res.json({
                        success: true,
                        user: user[0],
                        isAdmin: false
                    });
                }

            }

        }
    } catch (e) {
        res.send({
            success: false,
            message: e.message
        })
    }

}

exports.changePassword = async function (req, res) {
    try {
        let curPassword = req.body.cur_password;
        let newPassword = req.body.new_password;
        console.log(curPassword, newPassword);
        let username = req.body.username;
        let new_password_hash = "";
        await bcrypt.hash(newPassword, saltRounds, function (err, hash) {
            // Store hash in database
            new_password_hash = hash;
        });

        let user = await pool.query("select * from employer where username=?", [username]);
        if (user.length === 0) {
            res.send({
                success: false,
                message: "Current password is not valid."
            })
        } else {
            await pool.query("UPDATE employer SET password_hash=? where username=?", [new_password_hash, username]);
            res.send({
                success: true,
                message: "Password changed successfully."
            })
        }

    } catch (e) {
        res.send({
            success: false,
            message: e.message
        })
    }
}


// change email
exports.changeEmail = async function(req, res){
    try {
        let curEmail = req.body.cur_email;
        let newEmail = req.body.new_email;
      
        let user = await pool.query("select * from employer where username=?", [curEmail]);
        console.log(user);
        if (user.length === 0) {
            res.send({
                success: false,
                message: "Current Email is not valid."
            })
        } else {
            let userId = user[0].id;
            await pool.query("UPDATE employer SET username=? where id=?", [newEmail, userId]);
            res.send({
                success: true,
                message: "Email changed successfully."
            })
        }

    } catch (e) {
        res.send({
            success: false,
            message: e.message
        })
    }
}
