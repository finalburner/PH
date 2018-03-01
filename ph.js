"use strict";//----------------------OPC-------------------------
/////////////// =========================== ////////////////////
const Version = "1.3.10"
console.log("API Programme Horaire version : " + Version )
/////////////// =========================== ////////////////////
const P = require(process.cwd()+ '/config.ini')
var nrc = require('node-run-cmd');
var sql = require('mssql');
var express = require('express');
var fs = require('fs') ;
var app = express();
var cors = require('cors')
var path = require('path');
var bodyParser = require("body-parser");
var morgan = require('morgan');             // log requests to the console (express4)

app.listen(P.SRV.HTTP_PORT,function(){
    console.log('Server WEB PH running @ http://localhost:' + P.SRV.HTTP_PORT)
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use( '/' , express.static(__dirname + '/www/'));
app.use( '/js/param.js' , express.static(process.cwd()+ '/config_ihm.ini'));
// console.log(process.cwd())
// app.use(function(req, res, next){
//   res.status(404);
//   // default to plain-text. send()
//    res.type('txt').send('Not found');
//  });

 // app.options('*', cors()) // include before other routes

app.use(cors({ origin: '*' }));
 app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
 });
// app.options('*', cors());
app.use(cors({optionsSuccessStatus: 200 }));
app.options('*', cors({optionsSuccessStatus: 200 }));
// app.use(cors())
/* GET home page. */
// html_app.get('/*', function(req, res, next) {
//   //Path to your main file
//   res.status(200).sendFile(path.join(__dirname,'/'));
// });


//
// html_app.get('/', function(req, res) {
//   console.log(__dirname)
//     res.sendFile(path.join(__dirname + "/index.html"));
// });

// // PORT STANDARD DEJA OUVERT
// process.on('uncaughtException', function(err) { //Deal with used port 3000 : switch to 3001
//         if(err.errno === 'EADDRINUSE' && err.port === P.SRV.HTTP_PORT)
//             { console.log('Port '+ P.SRV.HTTP_PORT + ' already in use.');
//              app.close();
//              app.listen(P.SRV.HTTP_PORT, function(){
//                console.log('listening on *: ' + P.SRV.HTTP_PORT);
//              });
//            }
//          });
//PORT SSL DEJA OUVERT
 process.on('uncaughtException', function(err) { //Deal with used port 3000 : switch to 3001
             if(err.errno === 'EADDRINUSE' && err.port === P.SRV.HTTPS_PORT)
             { console.log('Port ' + P.SRV.HTTPS_PORT + ' already in use.');
              ssl.close();
              ssl.listen(P.SRV.HTTPS_PORT, function(){
                console.log('listening on *: ' + P.SRV.HTTPS_PORT);
              });
              }
        });


// app.get('*',function(req,res){
//     res.sendFile('index.html',{'root': __dirname });
// });



sql.connect(P.SQL).then(function() {
  // Query
console.log('MS SQL connected success : ' + P.SQL.server);
}).catch(function(err) {
        console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
});


app.post('/api/import_export' , function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('GF', sql.NVarChar,  b.GF)
  request.execute('PH_GET_ETAT_IMPORT_EXPORT', (err, recordset) => {
      if (err) { console.dir(err); res.send(err) }
      else
      res.json(recordset.recordset[0])
      // console.log(result[0])
  })
// console.dir(req.body)
});

app.post('/api/event' , function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
      request.input('groupeFonctionnel', sql.NVarChar,  b.ID)
      request.input('jourDebut', sql.DateTime, new Date(b.Period.dateDebut_Year,b.Period.dateDebut_Month,b.Period.dateDebut_Day,8,0,0))
      request.input('jourFin', sql.DateTime, new Date(b.Period.dateFin_Year,b.Period.dateFin_Month,b.Period.dateFin_Day,8,0,0))
      request.execute('dbo.usp_HorairesGroupeFonctionnelDatesComplet', (err, recordset) => {
        if (err) { console.dir(err); res.send(err) }
        else
        res.json(recordset.recordset)
      })
});

app.post('/api/event_ER' , function(req, res) {
    var b = req.body;
    // console.log(b)
    var request = new sql.Request()
                        .query("  SELECT *  from [PrgHoraires].[dbo].[t_TranchesRecurrentes] Where groupeFonctionnel=\'" + b.ID +"\'order by numJourSemaine,heureDebut")
                        .then(function(recordset) {
                         var ids = JSON.parse(JSON.stringify(recordset.recordset).replace(/"\s+|\s+"/g,'"'))
                         res.json(ids) ;
                       }).catch(function(err) {
                         res.send(err)
                         console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
                       });
     });

app.post('/api/DEFCOM' , function(req, res) {
    var b = req.body;
    console.log(b)
    var request = new sql.Request()
    request.input('CT', sql.NVarChar,  b.CT)
    request.execute('dbo.PH_GET_DEFCOM', (err, recordset) => {
      if (err) { console.dir(err); res.send(err) }
      else
      res.send({ CT: b.CT , GF:recordset.recordset})
    })
});




  // var request = new sql.Request()
  // request.input('groupeFonctionnel', sql.NVarChar,  b.ID)
  // request.input('jourDebut', sql.DateTime, new Date(b.Period.dateDebut_Year,b.Period.dateDebut_Month,b.Period.dateDebut_Day,8,0,0))
  // request.input('jourFin', sql.DateTime, new Date(b.Period.dateFin_Year,b.Period.dateFin_Month,b.Period.dateFin_Day,8,0,0))
  // // request.output('output_parameter', sql.Int)
  // request.execute('dbo.usp_HorairesGroupeFonctionnelDatesComplet', (err, result) => {
  //     if (err) { console.dir(err); res.send(err) }
  //     else
  //     res.json(result[0])
  // })
// console.dir(req.body)
//
app.post('/api/EG/List_CT', function(req, res) {
  var b = req.body;
  console.log(b)
  if(b.EG)
  {
  var request = new sql.Request()
  request.input('IDEG', sql.Int, b.EG )
  request.execute('dbo.usp_ListeCtAvecAppartennanceExceptionGlobale', (err, recordset) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        // console.dir(request)
        // console.log(recordset.recordset)
  res.send(recordset.recordset)
  }})
 }
 else {
   var request = new sql.Request()
   .query("  SELECT Distinct SUP_LOCALISATION as L from BDD_DONNEES.dbo.V_SUPERVISION")
   // .query("SELECT SUP_LOCALISATION as L , ID, SUP_LIBELLE_GPE as GP from BDD_DONNEES.dbo.V_SUPERVISION")
   .then(function(recordset) {
     var ids = JSON.parse(JSON.stringify(recordset.recordset).replace(/"\s+|\s+"/g,'"'))
     // console.log(ids)
      res.json(ids) ;
   }).catch(function(err) {
     res.send(err)
   console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
   });

 }

});

app.post('/api/EG/List_GF', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('IDEG', sql.NVarChar, b.EG )
  request.input('IDCT', sql.NVarChar, b.CT )
  request.execute('dbo.usp_ListeGroupeFonctionnelAvecAppartennanceExceptionGlobale', (err, recordset) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        // console.dir(request)
        console.log(recordset.recordset)
  res.send(recordset.recordset)
  }})
});

app.post('/api/LIST_EG_GF', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('IDGF', sql.NVarChar, b.EG )
  request.execute('dbo.usp_ListeEgAvecAppartennanceGroupeFonctionnel', (err, recordset) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        // console.dir(request)
        // console.log(recordset.recordset)
  res.send(recordset.recordset)
  }})
});

app.post('/api/EG/List', function(req, res) {
query("Select * from PrgHoraires.dbo.t_ExceptionsGlobales Order by MONTH(dateDebut),DAY(dateDebut)",req,res,true)
});

app.get('/api/Raison', function(req, res) {
  var request = new sql.Request()
  .query("SELECT * from PrgHoraires.dbo.t_RaisonsExceptions")
  .then(function(recordset) {
    var ids = JSON.parse(JSON.stringify(recordset.recordset).replace(/"\s+|\s+"/g,'"'))
    // console.dir(recordset.recordset)
     res.json(ids) ;
  }).catch(function(err) {
    res.send(err)
  console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
  });
});

app.post('/api/Droit', function(req, res) {
var b = req.body;
// console.log(b)
var DROIT = {}
var request = new sql.Request()
request.input('LOGIN', sql.NVarChar, b.login)
// request.output('output_parameter', sql.NVarChar)
request.execute('BDD_DONNEES.dbo.MOBILE_DROIT_UTILISATEUR', (err, recordset) => {
/// DROIT[x] correspond à la l'authorisation pour la fonction ID = x
var rec = recordset.recordset
// console.log(rec)
 for(var h=0; h<rec.length ; h++)
 DROIT[rec[h].C] = rec[h].A
 res.send(DROIT)
})
})

app.post('/api/Raison/Add', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('raison', sql.NVarChar, b.raison )
  request.execute('dbo.usp_RaisonsExceptions_Add', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        // console.dir(request)
        // console.log(result)
  res.send()
  }})
});


app.post('/api/Raison/Edit', function(req, res) {
  var b = req.body;
  // console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('id', sql.BigInt, b.id )
  request.input('raison', sql.NVarChar, b.raison )
  request.execute('dbo.usp_RaisonsExceptions_Update', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        // console.dir(request)
  // console.log(result)
  res.send(result)
  }})
});

app.post('/api/Raison/Del', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('id', sql.BigInt, b.id )
  request.execute('dbo.usp_RaisonsExceptions_Del', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        // console.dir(request)
        // console.log(result)
  res.send(result)
  }})
});


app.post('/api/EL/Add', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('horodateDebut', sql.DateTime, new Date(b.heureDebut) )
  request.input('horodateFin', sql.DateTime , new Date(b.heureFin) )
  request.input('dateException', sql.DateTime , new Date(b.dateException) )
  request.input('groupeFonctionnel', sql.NVarChar , b.GF )
  request.input('trancheRemplacee', sql.BigInt , b.idTranche )
  request.input('Exception', sql.BigInt , b.raison )
  request.execute('dbo.usp_ExceptionsLocales_Add', (err, recordset) => {
      if (err) { console.dir(err); res.send(err) }
      else {
res.send()
  }})
});

app.post('/api/EL/Update', function(req, res) {
  var b = req.body;
  console.log(b)
    var request = new sql.Request()
    // console.log(b.heureDebut )
  request.input('Login', sql.NVarChar, b.Login )
  request.input('horodateDebut', sql.DateTime, new Date(b.heureDebut))
  request.input('horodateFin', sql.DateTime,  new Date(b.heureFin))
  request.input('dateException', sql.DateTime ,  new Date(b.dateException))
  request.input('groupeFonctionnel', sql.NVarChar , b.GF )
  request.input('trancheRemplacee', sql.BigInt , b.idTrancheRemplace)
  request.input('id', sql.BigInt , b.idTranche)
  request.input('Exception', sql.BigInt , b.raison )
  request.execute('dbo.usp_ExceptionsLocales_Update', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        // console.log(err)
        // console.log(result)
res.send()
  }})
});

app.post('/api/EL/Del', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('id', sql.NVarChar, b.idTranche )
  request.execute('dbo.usp_ExceptionsLocales_Del', (err, recordset) => {
      if (err) { console.dir(err); res.send(err) }
      else {
res.send(recordset.recordset)
  }})
});

app.post('/api/TR/Add', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('horodateDebut', sql.DateTime, new Date(b.heureDebut) )
  request.input('horodateFin', sql.DateTime , new Date(b.heureFin) )
  request.input('groupeFonctionnel', sql.NVarChar , b.GF )
  request.input('numJourSemaine', sql.BigInt , b.day )
  request.execute('dbo.usp_TranchesRecurrentes_Add', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
res.send()
  }})
});

app.post('/api/TR/Update', function(req, res) {
  var b = req.body;
  console.log(b)
    var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('id', sql.BigInt , b.idTranche)
  request.input('horodateDebut', sql.DateTime, new Date(b.heureDebut) )
  request.input('horodateFin', sql.DateTime , new Date(b.heureFin) )
  request.input('groupeFonctionnel', sql.NVarChar , b.GF )
  request.input('numJourSemaine', sql.BigInt , b.day )
  request.execute('dbo.usp_TranchesRecurrentes_Update', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        console.log(err)
        console.log(result)
res.send()
  }})
});

app.post('/api/TR/Del', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('id', sql.NVarChar, b.idTranche )
  request.execute('dbo.usp_TranchesRecurrentes_Del', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        res.send()
  }})
});


app.post('/api/EG/Check_EG_GF', function(req, res) {
  var b = req.body;
  console.log(b)
    if (b.C)
    {
      var request = new sql.Request()
      request.input('Login', sql.NVarChar, b.Login )
      request.input('IdExceptionGlobale', sql.BigInt, b.EG )
      request.input('idGroupeFonctionnel', sql.NVarChar, b.ID )
      request.execute('dbo.usp_ApplicationsExceptionsGlobales_Add', (err, result) => {
          if (err) { console.dir(err); res.send(err) }
          else res.send()
    })}
    else
    {
      var request = new sql.Request()
      request.input('Login', sql.NVarChar, b.Login )
      request.input('IdExceptionGlobale', sql.BigInt, b.EG )
      request.input('idGroupeFonctionnel', sql.NVarChar, b.ID )
      request.execute('dbo.usp_ApplicationsExceptionsGlobales_Del', (err, result) => {
        if (err) { console.dir(err); res.send(err) }
        else res.send()
    })}
})

app.post('/api/EG/Add', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('Nom', sql.NVarChar, b.nom )
  request.input('Description', sql.NVarChar, b.description )
  request.input('dateDebut', sql.Date , b.dateDebut.slice(0,10) )
  request.input('dateFin', sql.Date , b.dateFin.slice(0,10) )
  request.input('repetitionAnnuel', sql.Bit , b.repetitionAnnuel )
  request.input('vacances', sql.Bit , b.vacances )
  request.execute('dbo.usp_ExceptionsGlobales_Add', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
res.send()
  }})
});


app.post('/api/EG/Edit', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('id', sql.BigInt, b.id )
  request.input('Nom', sql.NVarChar, b.nom )
  request.input('Description', sql.NVarChar, b.description )
  request.input('dateDebut', sql.Date , b.dateDebut.slice(0,10) )
  request.input('dateFin', sql.Date , b.dateFin.slice(0,10) )
  request.input('repetitionAnnuel', sql.Bit , b.repetitionAnnuel )
  request.input('vacances', sql.Bit , b.vacances )
  request.execute('dbo.usp_ExceptionsGlobales_Update', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        res.send()
      }})
})

// console.dir(req.body)
app.post('/api/EG/Del', function(req, res) {
  var b = req.body;
  console.log(b)
  var request = new sql.Request()
  request.input('Login', sql.NVarChar, b.Login )
  request.input('id', sql.BigInt, b.id)
  request.execute('dbo.usp_ExceptionsGlobales_Del', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        res.send()
  }})
// console.dir(req.body)
});



app.post('/api/GF/Import', function(req, res) {
var b = req.body;
console.log(b)
// Execution de l'import Import_PH.exe /f:PT93213_1 /a:True /
var Target = P.URL_Import + ' /f:' + b.PTE + ' /a:True /r'
// console.log(Target)

nrc.run(Target )
.then(function(codes) {
// console.log(codes)
var x = codes[0] >> 0 //Conversion UINT32 to INT3

if (codes[0].code && codes[0].code == 'ENOENT')
res.send({ EXITCODE : -40 })
else
res.send({ EXITCODE : x })

}, function(err) {
  console.log(err)
});

});

app.post('/api/GF', function(req, res) {
var b = req.body;
console.log(b)
query("Select DISTINCT ID, SUP_LIBELLE_GPE as I, SUP_ACQ_EQUIPEMENT AS E, SUP_LOCALISATION as L from BDD_DONNEES.dbo.V_SUPERVISION where ID = \'" + b.ID + "\'",req,res,true)
});

app.post('/api/List', function(req, res) {
  var b = req.body;
  var request = new sql.Request()
  request.input('LOGIN', sql.NVARCHAR, b.Login)
  request.execute('dbo.PH_GET_LIST_CT_GF', (err, result) => {
      if (err) { console.dir(err); res.send(err) }
      else {
        res.send(JSON.parse(JSON.stringify(result.recordset).replace(/"\s+|\s+"/g,'"')))
    }})
});

function query(query, req, res, read) { //read = true only for SELECT query
  var request =  new sql.Request()
  .query(query).then(function(recordset) {
  if(read) {
   var ids = JSON.parse(JSON.stringify(recordset.recordset).replace(/"\s+|\s+"/g,'"'))
  //  console.log(ids)
  res.json(ids) }
  else res.send()
  }).catch(function(err) {
  console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
  res.send(err)
  });
}

let detail= 'VS_VERSION_INFO VERSIONINFO\n\r' +
'FILEVERSION ' + Version.replace(/\./g,',') + ',0\n\r' +
'PRODUCTVERSION '+ Version.replace(/\./g,',') +',0\n\r' +
'FILEOS 0x40004\n\r' +
'FILETYPE 0x1\n\r' +
'{ \n\r' +
' BLOCK "StringFileInfo"\n\r' +
'{ \n\r' +
'  BLOCK "040904b0"\n\r' +
'    {   VALUE "FileDescription", "API Programmes Horaires"\n\r' +
'        VALUE "FileVersion", "' + Version + '"\n\r' +
'        VALUE "InternalName", "ph.exe"\n\r' +
'        VALUE "LegalCopyright", ""\n\r' +
'        VALUE "OriginalFilename", "ph.exe"\n\r' +
'        VALUE "ProductName", "API Programmes Horaires"\n\r' +
'        VALUE "ProductVersion", "' + Version + '"\n\r' +
'        VALUE "SquirrelAwareVersion", "1"\n\r' +
'    }\n\r' +
'}\n\r' +
'BLOCK "VarFileInfo"\n\r' +
'{\n\r' +
' VALUE "Translation", 0x0409,1200\n\r' +
'}\n\r' +
'}';

fs.writeFile('version-info.rc', detail, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
    console.log("Fichier de version généré")
});

//
//     // return p1 * p2;              // The function returns the product of p1 and p2
// }
// app.post('/api/addEvent', function(req, res) {
//
// var b = req.body;
// console.log(b)
// var add= "INSERT INTO dbo.Evenements(CT,DGF,Evenement,Debut,Fin) Values ('" + b.CT + "','" + b.DGF + "','" + b.Title + "','" + b.Debut + "','" + b.Fin + "')"
// query(add,req,res,false)
// });
//
// // app.post('/api/event', function(req, res) {
// // var b = req.body;
// // console.log(b)
// // var update= "UPDATE dbo.Evenements SET Debut=\'" +b.Debut+ "\',Fin=\'" +b.Fin+ "\',Evenement=\'" +b.Title+ "\' where id=\'" +b.Id+ "\'"
// // query(update,req,res,false)
// // });
//
// app.post('/api/delete', function(req, res) {
// var b = req.body;
// console.log(b)
// var update= "DELETE From dbo.Evenements Where id=\'" +b.Id+ "\'"
// query(update,req,res,false)
//    });
//



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
