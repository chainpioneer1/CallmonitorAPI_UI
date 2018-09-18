let pool = require('../database')
let util = require('../global/utilit');
//

exports.getsocial = async function (req, res) {

    let fromdate = 000000000;
    let todate = new Date();
    todate.setUTCHours(23, 59, 59, 999);
    todate = Math.round(todate.getTime())

    if (req.body.fromdate) {
        fromdate = new Date((req.body.fromdate));
        //fromdate.setUTCHours(0, 0, 0, 0);
        fromdate = Math.round(fromdate.getTime());
    }
    if (req.body.todate) {
        todate = new Date((req.body.todate));

        //todate.setUTCHours(23, 59, 59, 999);
        todate = todate.setDate(todate.getDate() + 1);
        todate = new Date(todate).toDateString();
        todate = Math.round(new Date(todate).getTime());
    }

    let expression = req.body.type;

    console.log('-------------------- 28 --------------- getSocial().request', req.body);

    switch (expression) {
        case 'topCallers':
            let gettopcallers = await topCallers(req.body, fromdate, todate);
            res.send({
                success: true,
                data: gettopcallers
            });
            break;
        case 'totalDurations':
            let gettotalduration = await totalduration(req.body, fromdate, todate, req.body.limitFrom);
            res.send({
                success: true,
                data: gettotalduration
            });
            break;
        case 'forgotenCallers':
            let getIgnore = await forgotten(req.body, fromdate, todate, req.body.limitFrom);
            res.send({
                success: true,
                data: getIgnore
            });
            break;
        case 'averageDurations':
            let getaverages = await Averages(req.body, fromdate, todate, req.body.limitFrom);
            res.send({
                success: true,
                data: getaverages
            });
            break;
        case 'pastFriends':
            let pastfriend = await pastFriend(req.body, fromdate, todate, req.body.limitFrom);
            res.send({
                success: true,
                data: pastfriend
            });
            break;
        case 'ignoreres':
            let ignoreres = await ignore(req.body, fromdate, todate, req.body.limitFrom);
            res.send({
                success: true,
                data: ignoreres
            });
            break;
        case 'friendliest':
            let friendliest = await friendList(req.body, fromdate, todate, req.body.limitFrom);
            res.send({
                success: true,
                data: friendliest
            });
            break;
        case "weeklydashboard":
            {
                console.log("weeklydashboard -----------------------");
                let weeklydashboard = await weekdashboard(req.body);
                res.send({
                    success: true,
                    data: weeklydashboard
                });
                break;
            }
        case "specialCalls":
            {
                console.log("specialcalls --------------------------");
                let special = await specialcalls(req.body, fromdate, todate, req.body.limitFrom);
                res.send({
                    success: true,
                    data: special
                });
                break;
            }
        default: {
            res.send({
                success: false,
                message: "No exist type."
            })
            break;
        }

    }

}

// top callers
async function topCallers(body, fromdate, todate) {
    console.log('topcallers ========== body =====', body, fromdate,todate);
    let data, data1;
    if (body.subType == 1) {
        data = await pool.query(`select logbook.number,count(*) as incomingtotalcalls
        from logbook 
        where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=1 or logbook.type=3)
        group by number
        order by incomingtotalcalls desc limit ?, 10`, [fromdate, todate, body.employeeId, body.limitFrom]);

        for (let i = 0; i < data.length; i++) {
            data1 = await Promise.all([
                pool.query(`select count(*) as outgoingtotalcalls from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and logbook.type=2 and logbook.number=?`, [fromdate, todate, body.employeeId, data[i].number]),
                pool.query('select contact.number, contact.name, contact.photo from contact where contact.number=? and contact.employee_id=? group by number', [data[i].number, body.employeeId])
            ]);
            data[i].outgoingtotalcalls = data1[0][0] ? data1[0][0].outgoingtotalcalls : 0;
            data[i].name = data1[1][0] ? data1[1][0].name : undefined;
            data[i].photo = data1[1][0] ? data1[1][0].photo : undefined;
        }

    } else {
        data = await pool.query(`select logbook.number,count(*) as outgoingtotalcalls
        from logbook 
        where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=2)
        group by number
        order by incomingtotalcalls desc limit ?, 10`, [fromdate, todate, body.employeeId, body.limitFrom]);
        for (let i = 0; i < data.length; i++) {
            data1 = await Promise.all([
                pool.query(`select count(*) as incomingtotalcalls from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=1 or logbook.type=3) and logbook.number=?`, [fromdate, todate, body.employeeId, data[i].number]),
                pool.query('select contact.number, contact.name, contact.photo from contact where contact.number=? and contact.employee_id=? group by number', [data[i].number, body.employeeId])
            ]);
            data[i].incomingtotalcalls = data1[0][0] ? data1[0][0].incomingtotalcalls : 0;
            data[i].name = data1[1][0] ? data1[1][0].name : undefined;
            data[i].photo = data1[1][0] ? data1[1][0].photo : undefined;
        }

    }
    return data;
}

// total duration
async function totalduration(body, fromdate, todate, limitFrom) {
    console.log('totalduration -------------', fromdate, todate, body.employeeId, body.subType, limitFrom);
    let data, data1;
    if(body.subType == 1){
        data = await pool.query(`select logbook.number,sum(logbook.duration) as incomingtotalduration
        from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=1)
        group by number
        order by incomingtotalduration desc limit ?, 10`, [fromdate, todate, body.employeeId, limitFrom]);
        
        for(let i = 0; i<data.length; i++){
            data1 = await Promise.all([
                pool.query(`select sum(logbook.duration) as outgoingtalduration from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=2) and logbook.number=?`, [fromdate, todate, body.employeeId, data[i].number]),
                pool.query('select contact.number, contact.name, contact.photo from contact where contact.number=? and contact.employee_id=? group by number', [data[i].number, body.employeeId])
            ]);
            data[i].incomingtotalduration = util.getTimeStamp(data[i].incomingtotalduration)
            data[i].outgoingtalduration = util.getTimeStamp(data1[0][0] ? data1[0][0].outgoingtalduration : 0);
            data[i].name = data1[1][0] ? data1[1][0].name : undefined;
            data[i].photo = data1[1][0] ? data1[1][0].photo : undefined;
        }
    }else{
        data = await pool.query(`select logbook.number,sum(logbook.duration) as outgoingtalduration
        from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=2)
        group by number
        order by outgoingtalduration desc limit ?, 10`, [fromdate, todate, body.employeeId, limitFrom]);
        
        for(let i = 0; i<data.length; i++){
            data1 = await Promise.all([
                pool.query(`select sum(logbook.duration) as incomingtotalduration from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=1) and logbook.number=?`, [fromdate, todate, body.employeeId, data[i].number]),
                pool.query('select contact.number, contact.name, contact.photo from contact where contact.number=? and contact.employee_id=? group by number', [data[i].number, body.employeeId])
            ]);
            data[i].outgoingtalduration = util.getTimeStamp(data[i].outgoingtalduration)
            data[i].incomingtotalduration = util.getTimeStamp(data1[0][0] ? data1[0][0].incomingtotalduration : 0);
            data[i].name = data1[1][0] ? data1[1][0].name : undefined;
            data[i].photo = data1[1][0] ? data1[1][0].photo : undefined;
        }
    }
    
    return data;
}

// special calls
async function specialcalls(body, fromdate, todate, limitFrom) {
    console.log('specialcalls ===============', fromdate, todate, body.employeeId, body.subType, limitFrom);
    let data, data1;
    let special_period = Math.round(body.special_period);

    let employeeList = await pool.query("select number from logbook where employee_id=? Group BY number ORDER BY number desc", [body.employeeId]);
    let incomingHistories = await pool.query("select * from logbook where employee_id=? and type=1 order by number desc", [body.employeeId]);
    let outgoingHistories = await pool.query("select * from logbook where employee_id=? and type=2 order by number desc", [body.employeeId]);

    let from = new Date(fromdate).toUTCString()
    
    let step = 86400000 * special_period;
    console.log('------------- sepecial calls ', body, fromdate,todate);
    let empList_incoming = [];
    let empList_outgoing = [];
    for(let i=0;i<employeeList.length; i++){
        let emp = {};
        emp.number = employeeList[i].number;
        emp.count = 0;
        let arr = incomingHistories.filter(a=>{
            return a.number == employeeList[i].number;
        });
        let length = arr.length;
        
        // console.log('-------- 216 ----------', employeeList[i].number, arr);
        if(length === 0) continue;
        for(let d= Math.floor(arr[0].date); d<Math.floor(arr[length - 1].date); d=d+step){
            let sarr = arr.filter(a=>{
                return Math.floor(a.date)>=(d-86400000) && Math.floor(a.date)<=(d+86400000+step);
            });
            if(sarr.length >0){
                emp.count += 1;
            }else{
                break;
            }
        }
        empList_incoming.push(emp);
    }
    
    for(let i=0;i<employeeList.length; i++){
        let emp = {};
        emp.number = employeeList[i].number;
        emp.count = 0;
        let arr = outgoingHistories.filter(a=>{
            return a.number == employeeList[i].number;
        })
        let length = arr.length;
        console.log('arr[length - 1]', arr[length - 1]);
        if(length === 0) continue;
        // console.log('-------- 216 ----------', employeeList[i].number, arr);
        for(let d= Math.floor(arr[0].date); d<Math.floor(arr[length - 1].date); d=d+step){
            let sarr = arr.filter(a=>{
                return Math.floor(a.date)>=(d-86400000) && Math.floor(a.date)<=(d+86400000+step);
            });
            if(sarr.length >0){
                emp.count += 1;
            }else{
                break;
            }
        }
        empList_outgoing.push(emp);
    }
    empList_incoming = empList_incoming.filter(a=>{
       return a.count!==0;
    }).sort((a,b)=>{
        return a.count>b.count;
    }).reverse();
    empList_outgoing = empList_outgoing.filter(a=>{
        return a.count!==0;
    }).sort((a, b)=>{
        return a.count>b.count;
    }).reverse();
    
    let resarray = [];
    for(let i=0;i<empList_incoming.length;i++){
        let res = {};
        let contactq = await pool.query("select photo, name from contact where employee_id=? and number=? group by number", [body.employeeId, empList_incoming[i].number]);
        res.number = empList_incoming[i].number;
        res.photo = contactq[0]?contactq[0].photo:undefined;
        res.name = contactq[0]?contactq[0].name:undefined;
        res.income_count = empList_incoming[i].count;
        let outs= empList_outgoing.filter(a=>{
            return a.number===res.number;
        });
        res.out_count = outs.length>0?outs[0].count:0;
        resarray.push(res);
    }
    console.log(resarray);
    return resarray;
}

// forgotten calls
async function forgotten(body, fromdate, todate, limitFrom) {
    let data = await pool.query(`select l.id,l.date,l.number,l.duration,l.recording,c.name, c.photo from logbook l left join contact c on l.number = c.number
     where (date BETWEEN ? and ?)  and l.employee_id=? and l.type=3 and l.number not in(select number from logbook where type=2 and date>? and employee_id=?)
      order by date desc limit ?, 10`, [fromdate, todate, body.employeeId, todate, body.employeeId, limitFrom]);
    let date, time;
    for (let i = 0; i < data.length; i++) {
        date = new Date(data[i].date);
        data[i].date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        data[i].time = date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
    }
    return (data);
}
// past friend
async function pastFriend(body, fromdate, todate, limitFrom) {
    let lastDate = new Date();
    lastDate = lastDate.setMonth(lastDate.getMonth() - Math.floor(body.period));
    console.log('lastDate', lastDate);

    let data = await pool.query(`select logbook.number,count('*') as incomingCall
    from logbook where date<? and  logbook.employee_id =? and logbook.type=1 GROUP BY number limit ?, 10`, [lastDate, body.employeeId, limitFrom]);

    for(let i = 0; i<data.length; i++){
        let q1 = await pool.query(`select logbook.number, count('*') as outgoingCall
        from logbook where date<? and logbook.employee_id =? and logbook.type=2 and number=? group by number`, [lastDate, body.employeeId, data[i].number]);
        let q2= await pool.query("select Max(date) as lastday from logbook where date<? and employee_id=? and number=?", [lastDate, body.employeeId, data[i].number]);

        data[i].outgoingCall = q1[0]?q1[0].outgoingCall:0;
        data[i].lastday = util.formatDate(q2[0]?q2[0].lastday:0);
        data[i].lasttime = util.formatAMPM(new Date(q2[0]?q2[0].lastday:0));
    }
    
    return data;
}

// ignore calls
async function ignore(body, fromdate, todate, limitFrom) {
    let data = await pool.query(`select logbook.number,count('*') as outgoingCall
    from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and logbook.type=2 GROUP BY number having outgoingCall>4`, [fromdate, todate, body.employeeId]);

    let data1 = await pool.query(`select logbook.number, count('*') as incomingCall
    from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and logbook.type=1 GROUP BY number`, [fromdate, todate, body.employeeId]);
    data1 = data1.filter(a=>{
        for(let i=0; i<data.length; i++){
            if(a.number === data[i].number){
                if(a.incomingCall <data[i].outgoingCall){
                    return true;
                }
            }
        }
        return false;
    });

    for (let i = 0; i < data.length; i++) {
        let indata = data1.filter(a=>{
            return a.number == data[i].number;
        })
        data[i].incomingCall = indata.length>0?indata[0].incomingCall:0;
        let qcontact = await pool.query("select * from contact where employee_id=? and number=?", [body.employeeId, data[i].number]);
        data[i].name = qcontact[0]?qcontact[0].name:undefined;
        data[i].photo = qcontact[0]?qcontact[0].photo:undefined;
        data[i].factor = data[i].outgoingCall/util.max(data[i].incomingCall, 1);
    }
    console.log('data----378', data);
    // sort
    
    let res = [];
    let curItem;
    while(res.length<data.length){
        curItem = {factor:0};
        let maxIndex=0;
        for(let i = 0; i<data.length; i++){
            if(data[i].factor>curItem.factor){
                curItem = data[i];
                maxIndex = i;
            }
        }
        data[maxIndex].factor = 0;
        res.push(curItem);
    }
    
    return (res);
}

// friendlist

async function friendList(body, fromdate, todate, limitFrom) {
    let data = await pool.query(`select logbook.number,count('*') as incomingCall
    from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and logbook.type=1 GROUP BY number having incomingCall>4`, [fromdate, todate, body.employeeId]);

    let data1 = await pool.query(`select logbook.number, count('*') as outgoingCall
    from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and logbook.type=2 GROUP BY number`, [fromdate, todate, body.employeeId]);
    data1 = data1.filter(a=>{
        for(let i=0; i<data.length; i++){
            if(a.number === data[i].number){
                if(a.outgoingCall <data[i].incomingCall){
                    return true;
                }
            }
        }
        return false;
    });

    for (let i = 0; i < data.length; i++) {
        let outdata = data1.filter(a=>{
            return a.number == data[i].number;
        })
        data[i].outgoingCall = outdata.length>0?outdata[0].outgoingCall:0;
        let qcontact = await pool.query("select * from contact where employee_id=? and number=?", [body.employeeId, data[i].number]);
        data[i].name = qcontact[0]?qcontact[0].name:undefined;
        data[i].photo = qcontact[0]?qcontact[0].photo:undefined;
        data[i].factor = data[i].incomingCall/util.max(data[i].outgoingCall, 1);
    }
    console.log('data----378', data);
    // sort
    let curVal = 0;
    let res = [];
    let curItem;
    while(res.length<data.length){
        curItem = {factor:0};
        let maxIndex=0;
        for(let i = 0; i<data.length; i++){
            if(data[i].factor>curItem.factor){
                curItem = data[i];
                maxIndex = i;
            }
        }
        data[maxIndex].factor = 0;
        res.push(curItem);
    }
    
    return (res);
}

// average calls
async function Averages(body, fromdate, todate, limitFrom) {
    console.log('totalduration -------------', fromdate, todate, body.employeeId, body.subType, limitFrom);
    let data, data1;
    if(body.subType == 1){
        data = await pool.query(`select logbook.number,avg(logbook.duration) as incomingtotalduration
        from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=1)
        group by number
        order by incomingtotalduration desc limit ?, 10`, [fromdate, todate, body.employeeId, limitFrom]);
        
        for(let i = 0; i<data.length; i++){
            data1 = await Promise.all([
                pool.query(`select avg(logbook.duration) as outgoingtalduration from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=2) and logbook.number=?`, [fromdate, todate, body.employeeId, data[i].number]),
                pool.query('select contact.number, contact.name, contact.photo from contact where contact.number=? and contact.employee_id=? group by number', [data[i].number, body.employeeId])
            ]);
            data[i].incomingtotalduration = util.getTimeStamp(data[i].incomingtotalduration)
            data[i].outgoingtalduration = util.getTimeStamp(data1[0][0] ? data1[0][0].outgoingtalduration : 0);
            data[i].name = data1[1][0] ? data1[1][0].name : undefined;
            data[i].photo = data1[1][0] ? data1[1][0].photo : undefined;
        }
    }else{
        data = await pool.query(`select logbook.number,avg(logbook.duration) as outgoingtalduration
        from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=2)
        group by number
        order by outgoingtalduration desc limit ?, 10`, [fromdate, todate, body.employeeId, limitFrom]);
        
        for(let i = 0; i<data.length; i++){
            data1 = await Promise.all([
                pool.query(`select avg(logbook.duration) as incomingtotalduration from logbook where (date BETWEEN ? and ?) and  logbook.employee_id =? and (logbook.type=1) and logbook.number=?`, [fromdate, todate, body.employeeId, data[i].number]),
                pool.query('select contact.number, contact.name, contact.photo from contact where contact.number=? and contact.employee_id=? group by number', [data[i].number, body.employeeId])
            ]);
            data[i].outgoingtalduration = util.getTimeStamp(data[i].outgoingtalduration)
            data[i].incomingtotalduration = util.getTimeStamp(data1[0][0] ? data1[0][0].incomingtotalduration : 0);
            data[i].name = data1[1][0] ? data1[1][0].name : undefined;
            data[i].photo = data1[1][0] ? data1[1][0].photo : undefined;
        }
    }
    
    return data;
}

// weekly dashboard
async function weekdashboard(body) {
    let today = new Date();
    let monday = util.getMonday(today);
    monday = monday.getTime();
    today = today.getTime();
    let days = ["SUNDAY", "MONDAY", "TUESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    let data_incoming = await pool.query(`select logbook.number, count(logbook.duration) as count, contact.name, contact.photo
    from logbook 
    LEFT JOIN contact on logbook.number = contact.number
    where (date BETWEEN ? and ?) and logbook.employee_id =? and logbook.type=1
    group by duration
    order by count desc limit 0,3`, [monday, today, body.employeeId]);
    let data_outgoing = await pool.query(`select logbook.number, count(logbook.duration) as count, contact.name, contact.photo
    from logbook 
    LEFT JOIN contact on logbook.number = contact.number
    where (date BETWEEN ? and ?) and logbook.employee_id =? and logbook.type=2
    group by duration
    order by count desc limit 0,3`, [monday, today, body.employeeId]);
    let data_most_duration = await pool.query(`select logbook.number, sum(logbook.duration) as totalduration, contact.name, contact.photo
    from logbook 
    LEFT JOIN contact on logbook.number = contact.number
    where (date BETWEEN ? and ?) and logbook.employee_id =?
    group by duration
    order by totalduration desc limit 0,3`, [monday, today, body.employeeId]);
    for (let i = 0; i < data_most_duration.length; i++) {
        data_most_duration[i].totalduration = util.getTimeStamp(data_most_duration[i].totalduration)
    }

    let data_most_calls = await pool.query(`select logbook.number, logbook.duration as duration, contact.name, contact.photo,logbook.type,logbook.date
    from logbook 
    LEFT JOIN contact on logbook.number = contact.number
    where (date BETWEEN ? and ?) and logbook.employee_id =?
    order by duration desc limit 0,3`, [monday, today, body.employeeId]);
    for (let i = 0; i < data_most_calls.length; i++) {
        console.log("273------------", new Date(data_most_calls[i].date), new Date(data_most_calls[i].date).getDay(), data_most_calls[i]);
        data_most_calls[i].duration = util.getTimeStamp(data_most_calls[i].duration)
        data_most_calls[i].day = days[new Date(data_most_calls[i].date).getDay()];
    }

    let data_forgotten = await pool.query(`select logbook.number, contact.name, contact.photo,logbook.date
    from logbook 
    LEFT JOIN contact on logbook.number = contact.number
    where (date BETWEEN ? and ?) and logbook.employee_id =? and logbook.type=3
    order by date desc limit 0,3`, [monday, today, body.employeeId]);
    for (let i = 0; i < data_forgotten.length; i++) {
        data_forgotten[i].day = days[new Date(data_forgotten[i].date).getDay()];
        let date = new Date(data_forgotten[i].date);
        data_forgotten[i].time = date.toLocaleTimeString()
    }
    return {
        incoming: data_incoming,
        outgoing: data_outgoing,
        most_duration: data_most_duration,
        most_calls: data_most_calls,
        most_forgot: data_forgotten
    }
}
