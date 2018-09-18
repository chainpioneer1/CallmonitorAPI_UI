let util = require('../global/utilit');
var pool = require('../database');

exports.getEmployerList = async function(req, res){
    try {
        let employerList = await pool.query("select * from employer");
        let resarray = [];
        
        for(let i = 0; i<employerList.length; i++){
            let emp = {};
            emp.username = employerList[i].username;
            emp.track_limit = employerList[i].track_limit;
            emp.subscription_ends_at = employerList[i].subscription_ends_at;
            emp.created_at = employerList[i].created_at;
            emp.id = employerList[i].id;
            let qEmployees = await pool.query("select count('*') as activecount from employee where employer_id=? and disabled=0 and deleted_at is null", [employerList[i].id]);
            emp.activecount = qEmployees[0].activecount;
            let qTotal = await pool.query("select SUM(logbook.duration) as total from logbook where employee_id IN (select id from employee where employer_id=?)", [employerList[i].id]);
            emp.totalduration = qTotal[0].total;
            resarray.push(emp);
        }
        res.send({
            success: true,
            data: resarray
        });
    }catch (err) {
        res.send({
            success: false,
            message: err.message
        });
    }
}

exports.addSeat = async function(req, res){
    let empId = req.query.empId;
    try{
        let q1 = await pool.query("SELECT * from employer where id=?", [empId]);
        let track = q1[0].track_limit;
        track = Math.floor(track) + 1;
        await pool.query("UPDATE employer SET track_limit=? WHERE id=?", [track, empId]);
        res.send({
            success: true
        })

    }catch (err){
        res.send({
            success: false,
            message: err.message
        })
    }
    
}

exports.delSeat = async function(req, res){
    let empId = req.query.empId;
    try{
        let q1 = await pool.query("SELECT * from employer where id=?", [empId]);
        let track = q1[0].track_limit;
        track = Math.floor(track) - 1;
        await pool.query("UPDATE employer SET track_limit=? WHERE id=?", [track, empId]);
        res.send({
            success: true
        })
    }catch (err){
        res.send({
            success: false,
            message: err.message
        })
    }
}

// deactive
exports.deactivate = async function(req, res){
    // let empId = req.query.empId;
    // try{
    //     let q1 = await pool.query("SELECT * from employer where id=?", [empId]);
    //     let track = q1[0].track_limit;
    //     track = Math.floor(track) - 1;
    //     await pool.query("UPDATE employer SET track_limit=? WHERE id=?", [track, empId]);
    //     res.send({
    //         success: true
    //     })
    // }catch (err){
    //     res.send({
    //         success: false,
    //         message: err.message
    //     })
    // }
    res.send({
        message: 'i dont know.'
    })
}