// Sample Phone book app using Nodejs, mySql, and REST
// Jim Skon, Kenyon, Summer 2020
var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
// set to your port
var port = 9020
app.use(express.static('public'));
//Serve up web page as the default
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/public/" + "artApp.html" );
})

function openSQL() {
    // Login to MySQL
    var con = mysql.createConnection({
    	host: "localhost",
    	user: "ellingwood1",
    	password: "S216410",
    	database: "ellingwood1"
        });
        con.connect(function(err) {
            if (err) throw err;
        });
        return con;
}

var con = openSQL();

/*
Sample express call structure:

app.get('/operation', function(req, res){

console.log("Query:"+JSON.stringify(req.query));
if (req.query.field === undefined || req.query.search === undefined) {
  console.log("Missing query value!");
  res.end('[]');
} else {
  field=req.query.field;
  search=req.query.search;
  console.log(field+":"+search);


  query="SQL QUERY;";
  con.query(query, function(err,result,fields) {
     if (err) throw err;
     console.log(result)
     res.end( JSON.stringify(result));
  });
});

*/

//keeping this because it seems potentially useful
function missingField(p) {
    return (p.First === undefined || p.Last === undefined || p.Phone === undefined || p.Type === undefined);
}

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
