var pool = require('../database');
let util = require('../global/utilit');
exports.getLineChartData = async function (req, res) {
    try {
        let body = req.body;
        let startofclient = body.start;

        let start = new Date(new Date(startofclient).toUTCString()).getTime();
        let timediff = startofclient - start;

        let endofclient = body.end;
        let end = new Date(new Date(endofclient).toUTCString()).getTime();
        let empid = body.empid;
        let period = body.period;

        let chartData = {

        };

        console.log('---- start --, end --, period ----', start, end, period);

        let step = Math.floor(period);

        let resarray; // temp variable

        let missedArray = [];
        let missedPercentArray = [];

        let newcallArray = [];
        let newCallPercentArray = [];

        let incomingArray = [];
        let incomingCallDurationSumArray = [];
        let incomingCallDurationAvgArray = [];

        let outgoingArray = [];
        let outgoingCallDurationSumArray = [];
        let outgoingCallDurationAvgArray = [];
        let dateArray = [];

        let callbackArray = [];

        let totalCount;

        let totalQuery = await pool.query('select count(*) as totalCount from logbook where (date BETWEEN ? and ?) and employee_id=?', [start, end, empid]);
        totalCount = totalQuery[0] ? totalQuery[0].totalCount : 0;

        let date_format_opt = { year: 'numeric', month: 'short', day: 'numeric' };
        let date_locale_opt = "en-US";

        if (totalCount === 0) {
            res.send({
                success: false,
                message: "No Data"
            });
            return;
        }
        let totalValueArray = await Promise.all([
            pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?) and employee_id=? and (type=1 or type=3) ', [start, end, empid]),
            pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?)and employee_id=? and type=2', [start, end, empid]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and type=3', [start, end, empid]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and logbook.number not in (select logbook.number from logbook where employee_id=? and date<?)', [start, end, empid, empid, start]),
            pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and type=5', [start, end, empid]),
        ]);

        let callbackquery = await pool.query("select * from logbook where employee_id=? and (date BETWEEN ? and ?) order by date asc", [empid, start, end]);
        let callbackdelay_total = 0;
        let firsttime = 0;
        for (let i = 0; i < callbackquery.length; i++) {
            if (callbackquery[i].type == 3) {
                firsttime = callbackquery[i].date;
            }
            if (callbackquery[i].type == 2 || callbackquery[i].type == 1) {
                if (firsttime !== 0) {
                    callbackdelay_total += Math.floor(callbackquery[i].date) - Math.floor(firsttime);
                    firsttime = 0;
                }
            }
        }



        for (let time = start; time <= end + 1000 - step; time += step) {

            resarray = await Promise.all([
                pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?) and employee_id=? and (type=1 or type=3) ', [time, time + step, empid]),
                pool.query('select count(type) as count,sum(duration) as sum,avg(duration) as average from logbook where (date BETWEEN ? and ?)and employee_id=? and type=2', [time, time + step, empid]),
                pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and type=3', [time, time + step, empid]),
                pool.query('select count(type) as count,sum(duration) as sum from logbook where (date BETWEEN ? and ?) and employee_id=? and logbook.number not in (select logbook.number from logbook where employee_id=? and date<?)', [time, time + step, empid, empid, time]),
                pool.query('select count(*) as totalCount from logbook where (date BETWEEN ? and ?) and employee_id=?', [time, time + step, empid])
            ]);

            let callbackquery1 = await pool.query("select * from logbook where employee_id=? and (date BETWEEN ? and ?) order by date asc", [empid, time, time + step]);
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

            let nTotal = (resarray[4][0] && resarray[4][0].totalCount) ? resarray[4][0].totalCount : 1;

            // if(step === 3600000){
            //     dateArray.push(util.formatAMPM_HOUR(new Date(time + timediff)));
            // }else{
            //     dateArray.push(util.formatDate());
            // }
            dateArray.push(time + timediff);
            incomingArray.push((resarray[0][0] && resarray[0][0].count) ? Math.round(resarray[0][0].count) : 0);
            incomingCallDurationSumArray.push((resarray[0][0] && resarray[0][0].sum) ? Math.round(resarray[0][0].sum) : 0);
            incomingCallDurationAvgArray.push((resarray[0][0] && resarray[0][0].average) ? Math.round(resarray[0][0].average) : 0);

            outgoingArray.push((resarray[1][0] && resarray[1][0].count) ? Math.round(resarray[1][0].count) : 0);
            outgoingCallDurationSumArray.push((resarray[1][0] && resarray[1][0].sum) ? Math.round(resarray[1][0].sum) : 0);
            outgoingCallDurationAvgArray.push((resarray[1][0] && resarray[1][0].average) ? Math.round(resarray[1][0].average) : 0);

            missedArray.push((resarray[2][0] && resarray[2][0].count) ? resarray[2][0].count : 0);
            missedPercentArray.push((resarray[2][0] && resarray[2][0].count) ? Math.round(resarray[2][0].count / nTotal * 100) : 0);

            newcallArray.push((resarray[3][0] && resarray[3][0].count) ? Math.round(resarray[3][0].count) : 0);
            newCallPercentArray.push((resarray[3][0] && resarray[3][0].count) ? Math.round(resarray[3][0].count / nTotal * 100) : 0);
            callbackArray.push(callbackdelay/1000)
            

        }
        chartData.dates = dateArray;
        chartData.incomingCalls = incomingArray;
        chartData.incomingCallSum = incomingCallDurationSumArray;
        chartData.incomingCallAvg = incomingCallDurationAvgArray;

        chartData.outCalls = outgoingArray;
        chartData.outCallSum = outgoingCallDurationSumArray;
        chartData.outCallAvg = outgoingCallDurationAvgArray;

        chartData.missedCalls = missedArray;
        chartData.missedCallPercent = missedPercentArray;

        chartData.newCalls = newcallArray;
        chartData.newCallPercent = newCallPercentArray;
        chartData.callbackDelay = callbackArray;


        totalData = {};
        totalData.incomingCalls = (totalValueArray[0][0] && totalValueArray[0][0].count) ? Math.round(totalValueArray[0][0].count) : 0;
        totalData.incomingCallSum = (totalValueArray[0][0] && totalValueArray[0][0].sum) ? Math.round(totalValueArray[0][0].sum) : 0;
        totalData.incomingCallAvg = (totalValueArray[0][0] && totalValueArray[0][0].average) ? Math.round(totalValueArray[0][0].average) : 0;

        totalData.outCalls = (totalValueArray[1][0] && totalValueArray[1][0].count) ? Math.round(totalValueArray[1][0].count) : 0;
        totalData.outCallSum = (totalValueArray[1][0] && totalValueArray[1][0].sum) ? Math.round(totalValueArray[1][0].sum) : 0;
        totalData.outCallAvg = (totalValueArray[1][0] && totalValueArray[1][0].average) ? Math.round(totalValueArray[1][0].average) : 0;

        totalData.missedCalls = (totalValueArray[2][0] && totalValueArray[2][0].count) ? Math.round(totalValueArray[2][0].count) : 0;
        totalData.missedCallPercent = (totalValueArray[2][0] && totalValueArray[2][0].count) ? Math.round(totalValueArray[1][0].count / totalCount * 100) : 0;

        totalData.newCalls = (totalValueArray[3][0] && totalValueArray[3][0].count) ? Math.round(totalValueArray[3][0].count) : 0;
        totalData.newCallPercent = (totalValueArray[3][0] && totalValueArray[3][0].count) ? Math.round(totalValueArray[3][0].count / totalCount * 100) : 0;
        totalData.callbackDelay = callbackdelay_total/1000;

        res.send({
            success: true,
            chartData,
            totalData,
            period: period
        });


    } catch (err) {
        res.send({
            success: false,
            message: err.message
        })
    }
}