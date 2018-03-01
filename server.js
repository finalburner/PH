"use strict";//----------------------OPC-------------------------
const sql = require('mssql');
var express = require('express');
var fs = require('fs') ;
var app = express();
var opn = require('opn');
var cors = require('cors');
const path = require('path')
var bodyParser = require("body-parser");
var https = require('https');
var sslOptions = {
  key: fs.readFileSync('./file.pem'),
  cert: fs.readFileSync('./file.crt'),
  requestCert: true,
  rejectUnauthorized: false
};
var ssl = https.createServer(sslOptions, app);
var morgan = require('morgan');             // log requests to the console (express4)
console.log(__dirname + '/*')
path.join(__dirname + '/*')
ssl.listen(5000,function(){
    console.log('Server web PH running @ https://localhost:5000')
});
process.on('uncaughtException', function(err) { //Deal with used port 3000 : switch to 3001
        if(err.errno === 'EADDRINUSE' && err.port === '5000')
            { console.log('Port 5000 already in use. Using Port 5001');
             ssl.close();
             ssl.listen(5001, function(){
               console.log('listening on *:5001 ssl');
             });
           }

    });
// app.use(parser.urlencoded({extended : true}));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// opn('http://localhost:5000', {app: 'chrome'});

app.use('/',  express.static(__dirname + '/'));

// app.get('*',function(req,res){
//     res.sendFile('index.html',{'root': __dirname });
// });

var config = {
    user: 'BdConnectClient',
    password: 'Uuxwp7Mcxo7Khy',
    // user : 'root',
    // password:'P@ssw0rd',
    // server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    server: '10.18.10.3\\MSSQLSERVER',
    database: 'PrgHoraires',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

sql.connect(config).then(function() {
  // Query
console.log('MS SQL connected success');
}).catch(function(err) {
        console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
});


function get_section(req,res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('groupeFonctionnel', sql.Int, '2')
  request.input('jourDebut', sql.DateTime, new Date(b.dateDebut_Year,b.dateDebut_Month,b.dateDebut_Day,8,0,0))
  request.input('jourFin', sql.DateTime, new Date(b.dateFin_Year,b.dateFin_Month,b.dateFin_Day,8,0,0))
  // request.output('output_parameter', sql.Int)
  request.execute('dbo.usp_HorairesGroupeFonctionnelDates', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
      res.json(result[0])
      console.dir(result[0]) // count of recordsets returned by the procedure
      // console.log(result.recordsets[0].length) // count of rows contained in first recordset
      // console.log(result.recordset) // first recordset from result.recordsets
      // console.log(result.returnValue) // procedure return value
      // console.log(result.output) // key/value collection of output values
      // console.log(result.rowsAffected) // array of numbers, each number represents the number of rows affected by executed statemens

      // ...
  }})

}


// function query(query, req, res, read) { //read = true only for SELECT query
//   var request =  new sql.Request()
//   .query(query).then(function(recordset) {
//   if(read) { var ids = JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
//   res.json(ids) }
//   else res.send()
//   }).catch(function(err) {
//   console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
//   res.send(err)
//   });
//
//     // return p1 * p2;              // The function returns the product of p1 and p2
// }

app.post('/api/event', function(req, res) {
get_section(req,res)
// console.dir(req.body)
});

app.post('/api/addEvent', function(req, res) {

var b = req.body;
console.log(b)
var add= "INSERT INTO dbo.Evenements(CT,DGF,Evenement,Debut,Fin) Values ('" + b.CT + "','" + b.DGF + "','" + b.Title + "','" + b.Debut + "','" + b.Fin + "')"
query(add,req,res,false)
});

app.post('/api/event', function(req, res) {
var b = req.body;
console.log(b)
var update= "UPDATE dbo.Evenements SET Debut=\'" +b.Debut+ "\',Fin=\'" +b.Fin+ "\',Evenement=\'" +b.Title+ "\' where id=\'" +b.Id+ "\'"
query(update,req,res,false)
});

app.post('/api/delete', function(req, res) {
var b = req.body;
console.log(b)
var update= "DELETE From dbo.Evenements Where id=\'" +b.Id+ "\'"
query(update,req,res,false)
   });



app.use(function(req, res, next){
  res.status(404);
  // default to plain-text. send()
   res.type('txt').send('Not found');
 });





//     var request =  new sql.Request()
//
//      //    .input('input_parameter', sql.Int, value)
//       // .query('select TOP 5 * from SUPERVISION where id = @input_parameter').then(function(recordset) {
//
//       .query('select TOP '+ SELECT + ' * from dbo.SUPERVISION  ').then(function(recordset) {
//
//       //  ids=JSON.stringify(recordset, [ 'Metier', 'Installation_technique','NomGroupeFonctionnel','DesignGroupeFonctionnel','NomObjetFonctionnel','DesignObjetFonctionnel','Information','Libelle_information']);
//       ids = JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
//       console.log(Object.keys(ids).length);
//
//       //  TOTAL = Object.keys(ids).length;
//       // console.log(ids);
//       callback();
//       }).catch(function(err) {
//
//         console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
//     });
//
//     }).catch(function(err) {
//         console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
//
//     });



      // use mongoose to get all todos in the database
      // Todo.find(function(err, todos) {
      //
      //     // if there is an error retrieving, send the error. nothing after res.send(err) will execute
      //     if (err)
      //         res.send(err)
      //
      //     res.json(todos); // return all todos in JSON format
