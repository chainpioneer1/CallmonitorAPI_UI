var bcrypt = require('bcrypt');
let util = require('../global/utilit');
var pool = require('../database');
const saltRounds = 10;

exports.getEmployeeList = async function (req, res) {
    try {
        pool.query('SELECT id,username,name,recording_enabled,disabled FROM employee where employer_id=? and deleted_at is null ', req.query.id, function (error, results) {
            if (error) throw error;
            res.send({
                success: true,
                data: results
            });
        })
    } catch (err) {
        res.send({
            status: false,
            message: err.message
        })
    }
}

exports.getEmployeeDetails = async function(req, res){
    try {
        var fromdate = 000000000;
        var todate = new Date();
        todate.setUTCHours(23, 59, 59, 999);
        todate = Math.round(todate.getTime());

        if (req.body.fromDate) {
            fromdate = new Date((req.body.fromDate));
            fromdate.setUTCHours(0, 0, 0, 0);
            fromdate = Math.round(fromdate.getTime())
        }
        if(req.body.toDate){
            todate = new Date((req.body.toDate));
            todate.setUTCHours(23, 59, 59, 999);
            todate = Math.round(todate.getTime())
        }
        let totalQuery = await pool.query('select count(*) as totalCount from logbook where (date BETWEEN ? and ?) and employee_id=?', [fromdate, todate, req.body.employeeId]);
        let totalCount = totalQuery[0]?totalQuery[0].totalCount:0;

        if(totalCount === 0){
            res.send({
                success: false,
                message: "No Data"
            });
            return;
        }
        
        var resarray = await Promise.all([
            pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?) and employee_id=? and (type=1 or type=3)', [fromdate, todate, req.body.employeeId]),
            pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?)and employee_id=? and type=2', [fromdate, todate, req.body.employeeId]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and type=3', [fromdate, todate, req.body.employeeId]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and type=5', [fromdate, todate, req.body.employeeId]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and logbook.number not in (select logbook.number from logbook where employee_id=? and date<?) ', [fromdate, todate, req.body.employeeId, req.body.employeeId, fromdate]),
            pool.query('select * from logbook where (date BETWEEN ? and ?) and employee_id=? ORDER BY date', [fromdate, todate, req.body.employeeId]),
            pool.query('select Min(logbook.date) as date from logbook WHERE employee_id=?', [req.body.employeeId]),
            pool.query('select Max(logbook.date) as date from logbook WHERE employee_id=?', [req.body.employeeId])
        ]);

        let callbackquery = await pool.query("select * from logbook where employee_id=? and (date BETWEEN ? and ?) order by date asc", [req.body.employeeId, fromdate, todate]);
        let callbackdelay = 0; 
        let firsttime = 0;
        for(let i = 0; i<callbackquery.length; i++){
            if(callbackquery[i].type==3){
                firsttime = callbackquery[i].date;
            }
            if(callbackquery[i].type==2 || callbackquery[i].type==1){
                if(firsttime!==0){
                    callbackdelay+=Math.floor(callbackquery[i].date) - Math.floor(firsttime);
                    firsttime = 0; 
                }
            }
        }
        res.send({
            success: true,
            data: {
                incomingCalls: resarray[0][0] ? resarray[0][0] : 0,
                outCalls: resarray[1][0] ? resarray[1][0] : 0,
                missedCalls: resarray[2][0] ? resarray[2][0] : 0,
                rejectcalls: resarray[3][0] ? resarray[3][0] : 0,
                newCalls: resarray[4][0]?resarray[4][0]:0,
                firstLogDate: resarray[5][0] ? new Date(resarray[5][0].date).toLocaleDateString(): 'N/A',
                mindate: resarray[6][0]? new Date(resarray[6][0].date).toLocaleDateString(): "1970-01-01",
                maxdate: resarray[7][0]? new Date(resarray[7][0].date).toLocaleDateString(): "2050-12-31",
                totalCount: totalCount,
                callbackdelay: callbackdelay/1000
            }
        })
    } catch (e) {
        res.send({
            success: false,
            message: e.message
        })
    }
    
}


exports.create_employee = async function(req, res, next){
    try{
        var username = req.body.username;
        var name = req.body.name;
        var password = req.body.password;
        var employer_id = req.body.id;
        let password_hash = bcrypt.hashSync(password, saltRounds);
        
        let insertquery = "INSERT INTO employee (employer_id, username, password_hash, name, recording_enabled, disabled) VALUES (?,?,?,?,?,?)";
        let value = [employer_id, username, password_hash, name, 1, 0];
        
        await pool.query(insertquery, value);
        
        let readquery = "SELECT * from employee";
        let allEmployees = await pool.query(readquery);
        let lastEmployee = allEmployees[allEmployees.length - 1];
        
        res.send({
            success: true,
            data: lastEmployee
        });

    }catch(e){
        res.json({
            success: false,
            message: req.body.username + " is duplicated."
        })
    }
}

exports.deactiveEmployee = async function(req, res, next){
    try{
        let empId = req.query.id;
        let query = "UPDATE employee SET disabled=1 WHERE id=?";
       
        await pool.query(query, empId);
        res.send({
            success: true
        })
    }catch(e){
        res.send({
            success: false,
            message: e.message
        })
    }
}

exports.deleteEmployee = async function(req, res, next){
    try{
        let empId = req.query.id;
        let query = "UPDATE employee SET deleted_at=? WHERE id=?";
        let deletedAt = new Date().getTime();
        let param = [deletedAt, empId];
        await pool.query(query, param);
        res.send({
            success: true
        })
    }catch(e){
        res.send({
            success: false,
            message: e.message
        })
    }
}


// contactlist
exports.getContactlist = async function (req, res) {
    try {
        pool.query('select * from contact where employee_id=?', req.query.employeid, function (error, results, fields) {
            if (error) throw error;
            res.send({
                success: true,
                message: "all contact",
                data: results
            });
        })
    } catch (err) {
        res.send({
            status: false,
            message: e.err.message
        })
    }
}
// get all call history
exports.getCallhistory = async function (req, res) {
    try {

        let fromdate = 000000000;
        let todate = new Date();
        todate.setUTCHours(23, 59, 59, 999);
        todate = Math.round(todate.getTime())

        if (req.body.fromdate) {
            fromdate = new Date((req.body.fromdate));
            //fromdate.setUTCHours(0, 0, 0, 0);
            fromdate = Math.round(fromdate.getTime());
        }
        if(req.body.todate){
            todate = new Date((req.body.todate));
            
            //todate.setUTCHours(23, 59, 59, 999);
            todate = todate.setDate(todate.getDate() + 1);
            todate = new Date(todate).toDateString();
            todate = Math.round(new Date(todate).getTime());
        }
        
        console.log('fromdate', fromdate);
        console.log('todate', todate);
        console.log('req.body.employeeId', req.body.employeeId);

        let callerList = await pool.query(`select distinct logbook.type,logbook.number as logbooknumber,logbook.date,logbook.duration,logbook.recording,contact.photo 
                         from logbook LEFT JOIN contact on logbook.number = contact.number
                         where (date BETWEEN ? and ?) and logbook.employee_id=?
                         ORDER BY date DESC limit ?,10`, [fromdate, todate, req.body.employeeId, req.body.limitFrom]);
        let callHistory;
        
        for(let i = 0; i<callerList.length; i++){
            callHistory = await Promise.all([
                pool.query("select count(type) as count from logbook where employee_id=? and (date BETWEEN ? and ?) and number=? and (type=1 or type=3)", [req.body.employeeId, fromdate, todate, callerList[i].logbooknumber]),
                pool.query("select count(type) as count from logbook where employee_id=? and (date BETWEEN ? and ?) and number=? and type=2", [req.body.employeeId, fromdate, todate, callerList[i].logbooknumber]),
                pool.query("select name from contact where employee_id=? and number=? limit 0,1", [req.body.employeeId, callerList[i].logbooknumber])
            ]);
            callerList[i].incomingCount = callHistory[0][0].count;
            callerList[i].outgoingCallCount = callHistory[1][0].count;
            callerList[i].duration = util.getTimeStamp(callerList[i].duration);
            callerList[i].contactname = callHistory[2][0]?callHistory[2][0].name:undefined;
            callerList[i].nDate = Math.round(new Date(callerList[i].date).getTime());
        }   
       
        res.json({
            success: true,
            data: callerList
        })
        
    } catch (err) {
        console.log(err.message);
        res.send({
            success: false,
            message: err.message
        })
    }
}

// change status
exports.changeStatus = async function (req, res) {
    try {
        await pool.query('update employee set disabled=? where id=?', [req.body.disabled, req.body.employeeId], (error, results) => {
            if (error) throw error;
            res.send({
                success: true,
                message: "status change",
                data: results
            })
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
}

// get returning calls
exports.getReturningCalls = async function (req, res){
    try{
        let period = req.body.period;
        let empId = req.body.empId;
        await pool.query("SELECT count(*) from logbook ")
        res.send({
            success: true,
            data: []
        })
    }catch(error){
        res.send({
            success: false,
            message: error.message
        })
    }
}

// get emplist

exports.getEmpList = async function(req, res){
    try{
        let id = req.query.id;
        let data = await pool.query(`select * from employee where employer_id=?`, [id]);
        res.send({
            success: true,
            data: data
        })
    }catch(error){
        res.send({
            success: false,
            message: error.message
        })
    }
    
}