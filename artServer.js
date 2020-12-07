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
    search='%'+req.query.search+'%';
    console.log(req.query.search);

    query="SELECT * FROM art WHERE Title like ? or Author like ? or Technique like ? or Location like ? or Form like ? or Type like ? or School like ?";
    console.log(query, "(search="+search+")");
    //if someone could find a way to make the next line less repetitive...
    con.query(query, [search,search,search,search,search,search,search], function(err,result) {
      if (err) throw err;
      console.log(result)
      res.end( JSON.stringify(result));
    });
  }
});

app.get('/advanced', function(req, res){
  //find art piece (any field)
  console.log("Query:"+JSON.stringify(req.query));

  query="SELECT * FROM art WHERE Title like ? and Author like ? and Technique like ? and Location like ? and Form like '%"+req.query.form+"%' and Type like '%"+req.query.type+"%' and School like ? and Date like ? and Timeframe like ?";
  console.log(query+"(title="+req.query.title+";author="+req.query.author+"; technique="+req.query.technique+";location="+req.query.location+";school="+req.query.school+";date="+req.query.date+";timeframe="+req.query.timeframe+")")
  con.query(query, ['%'+req.query.title+'%', '%'+req.query.author+'%', '%'+req.query.technique+'%', '%'+req.query.location+'%', '%'+req.query.school+'%', '%'+req.query.date+'%', '%'+req.query.timeframe+'%'], function(err,result) {
    if (err) throw err;
    console.log(result)
    res.end( JSON.stringify(result));
  })
})

//query function for tags
app.get('/tag', function(req, res){
  //find art piece (any field)
  console.log("Query:"+JSON.stringify(req.query));

  query="SELECT * FROM art WHERE "+req.query.field+" like '"+req.query.term+"'";
  console.log(query)
  con.query(query, function(err,result) {
    if (err) throw err;
    console.log(result)
    res.end( JSON.stringify(result));
  })
})

app.get('/finduser', function(req, res){
  //find user by name
  console.log("Query:"+JSON.stringify(req.query));
  if (req.query.search === undefined) {
    console.log("Missing query value!");
    res.end('[]');
  } else {
    search='%'+req.query.search+'%';

    query="SELECT username, ID FROM users WHERE username like ?";
    console.log(query+"(username="+search+")")
    con.query(query, [search], function(err,result) {
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

    query="SELECT * FROM art WHERE ID = '"+req.query.search+"'";
    console.log(query)
    con.query(query, function(err,result) {
      if (err) throw err;
      console.log(result)
      res.end( JSON.stringify(result));
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
    query = "Insert INTO users(username, password, bio)  VALUES('"+req.query.username+"','"+req.query.password+"','"+'Bio'+"')";
    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

//check user exists
app.get('/getlogin', function(req,res)
{
  if (req.query.username==undefined || req.query.password==undefined) {
    console.log("Bad add request:"+JSON.stringify(req.query));
    res.end("['fail']");
  } else {
    query = "SELECT COUNT(*) as count FROM users WHERE username=? AND password=?";
    console.log(query, "(username="+req.query.username+[req.query.password]+")");
    con.query(query, [req.query.username, req.query.password], function(err,result,fields) {
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
  if(req.query.pieceid==undefined || req.query.username==undefined)
  {
    console.log("Bad favorite request:" + JSON.stringify(req.query));
    res.end("['fail']");
  }
  else
  {
    query = "SELECT (SELECT COUNT(user) FROM favorites WHERE artpieceID='"+req.query.pieceid+"') as count,";
    query += " (SELECT COUNT(user) FROM favorites WHERE user = '" + req.query.username + "' AND artpieceID='"+req.query.pieceid+"') as faved;";

    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

app.get('/getuserfavs', function(req, res){
  //find art by piece ID, from clicking on piece in search results
  console.log("Query:"+JSON.stringify(req.query));
  if (req.query.search === undefined) {
    console.log("Missing query value!");
    res.end('[]');
  } else {
    query="SELECT * FROM art WHERE ID IN (SELECT artpieceID FROM favorites WHERE user = '"+req.query.search+"') LIMIT 20";
    console.log(query)
    con.query(query, function(err,result) {
      if (err) throw err;
      console.log(result)
      res.end( JSON.stringify(result));
    })
  }
})

//Get bio
app.get('/getuserbio', function(req,res){
  console.log("Query:"+JSON.stringify(req.query));
  if(req.query.username === undefined)
  {
    console.log("Missing query value!");
    res.end('[]');
  } else {
    query = "SELECT bio FROM users WHERE username = ?;"
    console.log(query,"(username="+req.query.username+")")
    con.query(query, [req.query.username], function(err,result) {
      if (err) throw err;
      console.log(result)
      res.end( JSON.stringify(result));
    })
  }
})

//Add Bio
app.get('/addbio', function (req, res) {
  if (missingFieldBio(req.query)) {
    console.log("Bad add request:"+JSON.stringify(req.query));
    res.end("['fail']");
  } else {
    query = "UPDATE users SET bio = ? WHERE username = '" + req.query.username +"';";
    console.log(query+"(bio="+req.query.bio+")");
    con.query(query, [req.query.bio], function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

//check for reviews when art page opened
app.get('/getuserreview', function(req,res)
{
  if (req.query.pieceID==undefined || req.query.user==undefined) {
    console.log("Bad review request:"+JSON.stringify(req.query));
    res.end("['fail']");
  } else {
    query = "SELECT * FROM reviews WHERE artpieceID='"+req.query.pieceID+"' AND user='"+req.query.user+"'";
    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

//check for reviews when art page opened
app.get('/getreviews', function(req,res)
{
  if (req.query.pieceID==undefined) {
    console.log("Bad review request:"+JSON.stringify(req.query));
    res.end("['fail']");
  } else {
    query = "SELECT * FROM reviews WHERE artpieceID='"+req.query.pieceID+"' ORDER BY timestamp LIMIT 9";
    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

//replace or create review
app.get('/addreview', function(req,res) {
  if(req.query.user === undefined || req.query.pieceID === undefined)
  {
    console.log("Bad review request:" + JSON.stringify(req.query));
    res.end("['fail']");
  }
  else
  {
    //first, remove any review with the given identifiers
    query = "DELETE FROM reviews WHERE user = '" + req.query.user + "' AND artpieceID = '" + req.query.pieceID +"';";
    console.log(query);
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
    })
    //then, make a new review with those states
    query = "INSERT INTO reviews(user, artpieceID, review) VALUES('"+req.query.user+"','"+req.query.pieceID+"',?)";
    console.log(query+"(text="+req.query.review+")");
    con.query(query, [req.query.review], function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

app.get('/featured', function(req, res){
  console.log(req.query.idList)
  query="SELECT * FROM art WHERE ID IN ("+req.query.idList+")";
  console.log(query)
  con.query(query, function(err,result) {
    if (err) throw err;
    console.log(result)
    res.end( JSON.stringify(result));
  })
})

app.get('/sendrec', function(req,res) {
  if(req.query.user === undefined || req.query.pieceid === undefined || req.query.sender==undefined||req.query.comment==undefined)
  {
    console.log("Bad recommend request:" + JSON.stringify(req.query));
    res.end("['fail']");
  }
  else
  {
    query = "INSERT INTO recommendations(sendUser, receiveUser, artpieceID, message, timestamp) VALUES('"+req.query.sender+"',?,'"+req.query.pieceid+"',?,NOW())";
    console.log(query+"(to="+req.query.user+")"+"(message="+req.query.comment+")");
    con.query(query, [req.query.user, req.query.comment], function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
})

app.get('/checkrec',function(req, res){
  if(req.query.username==undefined){
    console.log("Bad recommend request:" + JSON.stringify(req.query));
    res.end("['fail']");
  }
  else
  {
    query = "SELECT * from recommendations LEFT JOIN art on art.ID=recommendations.artpieceID WHERE receiveUser='"+req.query.username+"';"
    con.query(query, function(err,result,fields) {
      if (err) throw err;
      console.log(result)
      res.end(JSON.stringify(result));
    })
  }
});

app.get('/removerec', function(req,res){
  if(req.query.sender==undefined||req.query.receiver==undefined||req.query.pieceid==undefined){
  console.log("Bad recommend request:" + JSON.stringify(req.query));
  res.end("['fail']");
}
else
{
  query = "DELETE from recommendations WHERE receiveUser='"+req.query.receiver+"' AND sendUser='"+req.query.sender+"' AND artpieceID="+req.query.pieceid+";"

  con.query(query, function(err,result,fields) {
    if (err) throw err;
    console.log(result)
    res.end(JSON.stringify(result)); //idk if we need this
  })
}
});

////**Helper functions**///
function missingFieldUser(p) {
  return (p.username === undefined || p.password === undefined);
}

function missingFieldBio(p) {
  return (p.username === undefined || p.bio === undefined);
}
var server = app.listen(port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})
