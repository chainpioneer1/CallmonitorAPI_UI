var pool = require('../database');

exports.getBarChartData = async function (req, res) {
    try {

        let body = req.body;
        let empId = body.empid;
        let firstDate = new Date(new Date(body.start).toUTCString()).getTime();

        let endDate = new Date(new Date(body.end).toUTCString()).getTime();
        if(endDate<firstDate+86400000){
            endDate = firstDate;
        }
        let resarrayOfDay = {};
        let callbackArray = [];
        for (let i = 0; i < 7; i++) {
            resarrayOfDay[i] = await Promise.all([
                pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?) and employee_id=? and (type=1 or type=3) and DAYOFWEEK(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i]),
                pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?)and employee_id=? and type=2 and DAYOFWEEK(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i]),
                pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and type=3 and DAYOFWEEK(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i]),
                pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and logbook.number not in (select logbook.number from logbook where employee_id=? and date<?) and DAYOFWEEK(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, empId, firstDate, i]),
                pool.query('select count(*) as totalCount from logbook where (date BETWEEN ? and ?) and employee_id=? and DAYOFWEEK(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i])
            ]);
            let callbackquery1 = await pool.query("select * from logbook where employee_id=? and (date BETWEEN ? and ?) and DAYOFWEEK(FROM_UNIXTIME(logbook.date/1000))=? order by date asc", [empId, firstDate, endDate, i]);
            let callbackdelay = 0;
            let firsttime = 0;
            for (let i = 0; i < callbackquery1.length; i++) {
                if (callbackquery1[i].type == 3) {
                    firsttime = callbackquery1[i].date;
                }
                if (callbackquery1[i].type == 2 || callbackquery1[i].type == 1) {
                    if (firsttime !== 0) {
                        callbackdelay += Math.floor(callbackquery1[i].date) - Math.floor(firsttime);
                        firsttime = 0;
                    }
                }
            }
            callbackArray[i] = callbackdelay/1000;
        }
        
       


        let chartDataOfDay = [];
        let daysofweek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let nTotal;
        for (let i = 0; i < 7; i++) {
            nTotal = resarrayOfDay[i][4][0].totalCount ? resarrayOfDay[i][4][0].totalCount : 1;
            chartDataOfDay.push({
                label: daysofweek[i],
                incomingCalls: resarrayOfDay[i][0][0].count,
                incomingCallSum: resarrayOfDay[i][0][0].sum,
                incomingCallAvg: resarrayOfDay[i][0][0].average,

                outCalls: resarrayOfDay[i][1][0].count,
                outCallSum: resarrayOfDay[i][1][0].sum,
                outCallAvg: resarrayOfDay[i][1][0].average,

                missedCalls: resarrayOfDay[i][2][0].count,
                missedCallPercent: Math.round(resarrayOfDay[i][2][0].count / nTotal * 100),

                newCalls: resarrayOfDay[i][3][0].count,
                newCallPercent: Math.round(resarrayOfDay[i][3][0].count / nTotal * 100),
                callbackDelay: callbackArray[i]
            });
        }
        res.send({
            success: true,
            chartDataOfDay
        });

    } catch (e) {
        res.json({
            success: false,
            message: e.message
        })
    }
}

exports.getHourlyBarChartData = async function (req, res) {
    try {

        let body = req.body;
        let empId = body.empid;
        let firstDate = new Date(new Date(body.start).toUTCString()).getTime();

        let endDate = new Date(new Date(body.end).toUTCString()).getTime();

        let resarrayOfHourly = {};
        let callbackArray = [];
        for (let i = 0; i < 24; i++) {
           resarrayOfHourly[i] = await Promise.all([
            pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?) and employee_id=? and (type=1 or type=3) and HOUR(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i]),
            pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?)and employee_id=? and type=2 and HOUR(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and type=3 and HOUR(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and logbook.number not in (select logbook.number from logbook where employee_id=? and date<?) and HOUR(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, empId, firstDate, i]),
            pool.query('select count(*) as totalCount from logbook where (date BETWEEN ? and ?) and employee_id=? and HOUR(FROM_UNIXTIME(logbook.date/1000))=?', [firstDate, endDate, empId, i])
           ]);

           let callbackquery1 = await pool.query("select * from logbook where employee_id=? and (date BETWEEN ? and ?) and HOUR(FROM_UNIXTIME(logbook.date/1000))=? order by date asc", [empId, firstDate, endDate, i]);
            let callbackdelay = 0;
            let firsttime = 0;
            for (let i = 0; i < callbackquery1.length; i++) {
                if (callbackquery1[i].type == 3) {
                    firsttime = callbackquery1[i].date;
                }
                if (callbackquery1[i].type == 2 || callbackquery1[i].type == 1) {
                    if (firsttime !== 0) {
                        callbackdelay += Math.floor(callbackquery1[i].date) - Math.floor(firsttime);
                        firsttime = 0;
                    }
                }
            }
            callbackArray[i] = callbackdelay/1000;
        }

      //  let resarrayOfHourly = await Promise.all(queries);
        let chartDataOfHourly = [];
        let h1, h2;
        for (let i = 0; i < 24; i++) {

            nTotal = resarrayOfHourly[i][4][0].totalCount ? resarrayOfHourly[i][4][0].totalCount : 1;

            h1 = i > 12 ? (i - 12) + 'PM' : i + 'AM';
            h2 = (i + 1) > 12 ? (i - 11) + 'PM' : (i + 1) + 'AM';
            chartDataOfHourly.push({ 
                label: h1 + " - " + h2, 
                incomingCalls: resarrayOfHourly[i][0][0].count,
                incomingCallSum: resarrayOfHourly[i][0][0].sum,
                incomingCallAvg: resarrayOfHourly[i][0][0].average,

                outCalls: resarrayOfHourly[i][1][0].count,
                outCallSum: resarrayOfHourly[i][1][0].sum,
                outCallAvg: resarrayOfHourly[i][1][0].average,

                missedCalls: resarrayOfHourly[i][2][0].count,
                missedCallPercent: Math.round(resarrayOfHourly[i][2][0].count / nTotal * 100),

                newCalls: resarrayOfHourly[i][3][0].count,
                newCallPercent: Math.round(resarrayOfHourly[i][3][0].count / nTotal * 100),
                callbackDelay: callbackArray[i]
            });
        }

        res.send({
            success: true,
            chartDataOfHourly
        });

    } catch (e) {
        res.json({
            success: false,
            message: e.message
        })
    }
}