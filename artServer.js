// Server for art social network using Express and Node
// and some socket?
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
    database: "TeamC"
  });
  con.connect(function(err) {
    if (err) throw err;
  });
  return con;
}

var con = openSQL();


app.get('/find', function(req, res){
  //find art by piece Title
console.log("Query:"+JSON.stringify(req.query));
if (/*req.query.field === undefined ||*/ req.query.search === undefined) {
  console.log("Missing query value!");
  res.end('[]');
} else {
  //field=req.query.field;
  search=req.query.search;
  console.log(/*field+":"+*/search);

  //expanded general seach to more fields
  query="SELECT * FROM art WHERE Title like '%"+req.query.search+"%'or Author like '%"+req.query.search+"%' or Technique like '%"+req.query.search+"%' or Location like '%"+req.query.search+"%' or Form like '%"+req.query.search+"%' or Type like '%"+req.query.search+"%' or School like '%"+req.query.search+"%' ";
  console.log(query)
  con.query(query, function(err,result/*,fields*/) {
     if (err) throw err;
     console.log(result)
     res.end( JSON.stringify(result));
  })
    }
})

app.get('/getpiece', function(req, res){
  //find art by piece ID, from clicking on piece in search results
console.log("Query:"+JSON.stringify(req.query));
if (/*req.query.field === undefined ||*/ req.query.search === undefined) {
  console.log("Missing query value!");
  res.end('[]');
} else {
  //field=req.query.field;
  search=req.query.search;
  console.log(/*field+":"+*/search);


  query="SELECT * FROM art WHERE ID like '"+req.query.search+"' LIMIT 0,20";
  console.log(query)
  con.query(query, function(err,result/*,fields*/) {
     if (err) throw err;
     console.log(result)
     res.end( JSON.stringify(result));
  })
    }
})

//Add username and password to users table


app.get('/adduser', function (req, res) {
    // update a record by id
    if (missingFieldUser(req.query)) {
        console.log("Bad add request:"+JSON.stringify(req.query));
        res.end("['fail']");
    } else {
	query = "Insert INTO users(username, password)  VALUES('"+req.query.username+"','"+req.query.password+"')";
 	console.log(query);
	con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result)
	    res.end( JSON.stringify(result));
	})
    }
})

//TODO: Add express call to query database for art piece search

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

function missingFieldUser(p) {
    return (p.username === undefined || p.password === undefined);
}
var server = app.listen(port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})
