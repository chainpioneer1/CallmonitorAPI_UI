var express = require('express')
var app = express()

// api
    //var routes = require('./routes')
var user = require('./auth/user');
var employee = require('./employee/employee');
var employer = require('./employer/employer');
var social = require('./social/social');
// bodyParser
var bodyParser = require('body-parser')
var lineChart = require('./chart/lineChart')
var barChart = require('./chart/barChart')


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
var methodOverride = require('method-override')
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
 

var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');
 
app.use(cookieParser('keyboard cat'))
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash())

// enable CORS
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*
* Define routes
*/

// login
app.get('/', (req, res)=>res.send("Hello World"));
app.post('/api/login', user.login); // login
app.post('/api/changePassword', user.changePassword);
app.post('/api/changeEmail', user.changeEmail);

// employee list
app.get('/api/getEmployeeList', employee.getEmployeeList);
// employee detail
app.post('/api/getEmployeeDetails', employee.getEmployeeDetails); 
// create new employee
app.post('/api/create_employee', employee.create_employee);
// deactive employee
app.get('/api/deactiveEmployee', employee.deactiveEmployee);
// delete employee
app.get('/api/deleteEmployee', employee.deleteEmployee);

app.post('/api/getCallhistory', employee.getCallhistory);

// social
app.post('/api/getsocial', social.getsocial);


// Line chart
app.post('/api/getLineChartData', lineChart.getLineChartData);

// bar chart for daily
app.post('/api/getBarChartData', barChart.getBarChartData);

// get hourly bar chart data
app.post('/api/getHourlyBarChartData', barChart.getHourlyBarChartData);
// get Returning calls
app.post("/api/getReturningCalls", employee.getReturningCalls);

app.get("/api/getEmpList", employee.getEmpList);

// super admin API
app.get('/api/getEmployerList', employer.getEmployerList);

// add seat
app.get('/api/addSeat', employer.addSeat);

// remove one seat
app.get('/api/delSeat', employer.delSeat);

// deactive seat
app.get('/api/deactivate', employer.deactivate);

//
app.listen(3000, '0.0.0.0', function(){
    console.log('Server running at port 3000: http://127.0.0.1:3000')
})