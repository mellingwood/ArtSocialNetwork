// Server for art social network using Express and Node
var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');

// set to Team C's port
var port = 9020

app.use(express.static('public'));
//Serve up web page as the default
app.get('/', function (req, res) {
  res.sendFile( __dirname + "/public/artApp.html" );
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
  //find art piece (any field)
console.log("Query:"+JSON.stringify(req.query));
if (req.query.search === undefined) {
  console.log("Missing query value!");
  res.end('[]');
} else {
  search=req.query.search;
  console.log(search);

  //expanded general seach to more fields
  query="SELECT * FROM art WHERE Title like '%"+req.query.search+"%'or Author like '%"+req.query.search+"%' or Technique like '%"+req.query.search+"%' or Location like '%"+req.query.search+"%' or Form like '%"+req.query.search+"%' or Type like '%"+req.query.search+"%' or School like '%"+req.query.search+"%' ";
  console.log(query)
  con.query(query, function(err,result) {
     if (err) throw err;
     console.log(result)
     res.end( JSON.stringify(result));
  })
    }
})

app.get('/finduser', function(req, res){
  //find user by name
console.log("Query:"+JSON.stringify(req.query));
if (req.query.search === undefined) {
  console.log("Missing query value!");
  res.end('[]');
} else {
  search=req.query.search;
  console.log(search);

  query="SELECT * FROM users WHERE username like '%"+req.query.search+"%'";
  console.log(query)
  con.query(query, function(err,result) {
     if (err) throw err;
     console.log(result)
     res.end( JSON.stringify(result));
  })
    }
})


app.get('/getpiece', function(req, res){
  //find art by piece ID, from clicking on piece in search results
console.log("Query:"+JSON.stringify(req.query));
if (req.query.search === undefined) {
  console.log("Missing query value!");
  res.end('[]');
} else {
  search=req.query.search;
  console.log(search);

  query="SELECT * FROM art WHERE ID like '"+req.query.search+"' LIMIT 20";
  console.log(query)
  con.query(query, function(err,result) {
     if (err) throw err;
     console.log(result)
     res.end( JSON.stringify(result));
  })
    }
})

//check user doesn't already exist
app.get('/getlogin', function(req,res)
{
  if (req.query.username==undefined) {
      console.log("Bad add request:"+JSON.stringify(req.query));
      res.end("['fail']");
  } else {
    query = "SELECT * FROM users WHERE username='"+req.query.username+"'";
    console.log(query);
    con.query(query, function(err,result,fields) {
  	    if (err) throw err;
        console.log(result)
  	    res.end(JSON.stringify(result));
  	   })
      }
})

//check user doesn't already exist
app.get('/checkuser', function(req,res)
{
  if (req.query.username==undefined) {
      console.log("Bad add request:"+JSON.stringify(req.query));
      res.end("['fail']");
  } else {
    query = "SELECT COUNT(username) AS count FROM users WHERE username='"+req.query.username+"'";
    console.log(query);
    con.query(query, function(err,result,fields) {
  	    if (err) throw err;
  	    res.end(JSON.stringify(result));
  	   })
      }
})

//Add username and password to users table
app.get('/adduser', function (req, res) {
    if (missingFieldUser(req.query)) {
        console.log("Bad add request:"+JSON.stringify(req.query));
        res.end("['fail']");
    } else {
	query = "Insert INTO users(username, password)  VALUES('"+req.query.username+"','"+req.query.password+"')";
 	console.log(query);
	con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result)
	    res.end(JSON.stringify(result));
	   })
    }
})

app.get('/favorite', function(req,res) {
  if(req.query.username == undefined || req.query.pieceid == undefined)
  {
    console.log("Bad favorite request:" + JSON.stringify(req.query));
    res.end("['fail']");
  }
  else
  {
    if(req.query.addrem == "add"){
      query = "INSERT INTO favorites(user, artpieceID) VALUES('"+req.query.username+"','"+req.query.pieceid+"')";
    }
    else{
      query = "DELETE FROM favorites WHERE user = '" + req.query.username + "' AND artpieceID = '" + req.query.pieceid +"';";
    }
    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

app.get('/piecefavs', function(req,res){
  if(req.query.pieceid==undefined)
  {
    console.log("Bad favorite request:" + JSON.stringify(req.query));
    res.end("['fail']");
  }
  else
  {
    query = "SELECT COUNT(user) as count FROM favorites WHERE artpieceID='"+req.query.pieceid+"'";
    //NOTE: this query doesn't capture if a specific user has/n't favorited a piece

    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

app.get('/checkfav', function(req,res){
  if(req.query.pieceid==undefined || req.query.username==undefined)
  {
    console.log("Bad favorite request:" + JSON.stringify(req.query));
    res.end("['fail']");
  }
  else
  {
    query = "SELECT COUNT(user) as count FROM favorites WHERE user = '" + req.query.username + "' AND artpieceID='"+req.query.pieceid+"'";
    //NOTE: this query doesn't capture if a specific user has/n't favorited a piece

    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

app.get('/getuser', function(req, res){
  //find art by piece ID, from clicking on piece in search results
console.log("Query:"+JSON.stringify(req.query));
if (req.query.search === undefined) {
  console.log("Missing query value!");
  res.end('[]');
} else {
  search=req.query.search;
  console.log(search);

  query="SELECT * FROM art WHERE ID IN (SELECT artpieceID FROM favorites WHERE user = '"+req.query.search+"') LIMIT 20";
  console.log(query)
  con.query(query, function(err,result) {
     if (err) throw err;
     console.log(result)
     res.end( JSON.stringify(result));
  })
    }
})

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

function missingFieldUser(p) {
    return (p.username === undefined || p.password === undefined);
}

var server = app.listen(port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})
