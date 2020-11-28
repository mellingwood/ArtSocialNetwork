// JavaScript for Phone Application Demo Program Using Express and REST
// Jim Skon, Kenyon College, 2020
const port='9020' // Must match port used on server, port>8000


const Url='http://jimskon.com:'+port
var selectid;
var recIndex
var rows;
var thisUser;
var thisBio;

//var socket = io.connect('http://jimskon.com:'+port);

// Set up events when page is ready
$(document).ready(function () {
  // For this program is will be a reponse to a request from this page for an action

  // Clear everything on startup
  $('.loggedin').hide();
  $('#login-err').hide();
  $('#mainbar').hide();
  changeState("Home"); //may be redundant with above

  //make everything appear when you log in-- needs more hoops to jump through when we get the user functionality going, but works with just a click now
  $('#login-btn').click(function() {
    $('#login-err').hide();
    getLogin();

  });

  $('#newaccount-btn').click(function() {
    //bring to sign up page
    changeState("New User");
  });

  $('#smART').click(function(){
    changeState("Main")
  });

  $('#cancel-btn').click(function() {
    //cancel sign up
    console.log("cancel!");
    $('#addUserName').val('')
    $('#addPassword').val('')
    changeState("Home");
  });

  $('#signup-btn').click(function() {
    $('#signup-err').hide()
    checkUser();
  });

  //reacts to both user search and art search
  $('#search-btn').click(function() {

    var search = $('#search').val();

    if(search != "") {
      //reveal search results
      changeState("Search Results");
      clearResults();
      getMatches(search);
    } else {
      //make an error pop up if there is no search term
      // to avoid pulling up all pieces and taking a really long time
      $('#searchresults').html('<div class="modal" id="myModal"><div class="modal-dialog"><div class="modal-content"><!-- Modal Header --><div class="modal-header"><h4 class="modal-title">Modal Heading</h4><button type="button" class="close" data-dismiss="modal">&times;</button></div><!-- Modal body --><div class="modal-body">Modal body..</div><!-- Modal footer --><div class="modal-footer"><button type="button" class="btn btn-danger" data-dismiss="modal">Close</button></div></div></div></div>');
    }
  });

  //sends user to their own page
  $('#profile-btn').click(function() {
    getBio();
    $('#userfavs').empty();
    changeState("User Profile");
    $('#userpageName').empty();
    $('#userpageName').append(thisUser);
    getProfile(thisUser);
    $('#userpagebio').empty();
    $('#userpagebio').append(thisBio);
    console.log(thisBio)

  });

  //sends user to their own page
  $('#adv-search-btn').click(function() {
    changeState("Advanced Search");
  });

  $("#clear").click(clearResults);
  //NOTE: html element does not exist

  //function to go to page specific page when they click on picture
  $('#results').on('click', '.art', function(){
    //reveal individual art piece page
    changeState("Art Piece");
    getPiece($(this).attr('id'))
  });

  $('#userfavs').on('click', '.art', function(){
    //reveal individual art piece page
    changeState("Art Piece");
    getPiece($(this).attr('id'))
  });

  $('#results').on('click', '.username', function(){
    $('#userfavs').empty();
    $('#userpageName').empty();
    $('#userpageName').append($(this).text());
    changeState("User Profile");
    getProfile($(this).text()); //use the username; id is too complicated
  });

  $('#fav').click (function(){

    const emptyHeart = "\u2661";
    const fullHeart = "\u2665";

    console.log($('.pieceid').attr('id'));//debug
    console.log($(this).html());

    if($(this).html() == emptyHeart) {
      console.log("Entered if statement");
      $(this).html(fullHeart);
      $.ajax({
          url: Url+'/favorite?username='+thisUser+'&pieceid='+$('.pieceid').attr('id')+'&addrem=add',
          type:"GET",
          success: processFav,
          error: displayError
        })
    }
    else if($(this).html() == fullHeart) {
      $(this).html(emptyHeart);
      $.ajax({
          url: Url+'/favorite?username='+thisUser+'&pieceid='+$('.pieceid').attr('id')+'&addrem=rem',
          type:"GET",
          success: processFav,
          error: displayError
        })
      }
    });

  $('#submitReview-btn').click(function() {
    var sendID = $('#artpiecepage').find('.pieceid').attr("id");
    console.log(sendID)
    addReview(sendID)
  });

  //Handle pulldown menu
  $(".dropdown-menu li a").click(function(){
    $(this).parents(".btn-group").find('.selection').text($(this).text());
     //TODO: change dropdown selection
      //can use .split(" ").first(); to get first word (User or Art)
  });

});

//Sorry this is gross, ill make it one function but it's the only way I could get the modal working for now

  var modal = document.getElementById("myModal");
  // Get the button that opens the modal
  var btn = document.getElementById("myBtn");
  var saveBio = document.getElementById("submitBio-btn")
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  // When the user clicks on the button, open the modal
  btn.onclick = function() {
    modal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
}
  saveBio.onclick = function() {
    thisBio = $('#bioEnter').val()
    $('#userpagebio').empty();
    $('#userpagebio').append(thisBio);

    console.log(thisBio)
    addBio();

    $('#bioEnter').val('')

    modal.style.display = "none";
  }

////******** Functions not within document.ready **********//////


// This processes the results from the server after we have sent it a lookup request.
// This clears any previous work, and then calls buildTable to create a nice
// Table of the results, and pushes it to the screen.
// The rows are all saved in "rows" so we can later edit the data if the user hits "Edit"
function processResults(results) {
  //console.log("Results:"+results);
  clearResults();
  $('#searchresults').append(buildTable(results));
}

function processUserResults(results){
  clearResults();
  $('#searchresults').append(buildUserTable(results));
}

function processUser(results)
{
  thisUser=$('#addUserName').val(); //set who the logged in user is
  changeState("Main");
}

// This function shows and hides containers to change the state of the website
function changeState(pageState) {
  switch(pageState){
  case "Main":
    $('#mainbar').show();
    $('.loggedin').show(); //allow logged in stuff to be shown...
    $('.container').hide(); //but hide everything but home page
    $('#home').show();
    break;
  case "User Profile":
    $('.container').hide();
    $('#mainbar').show();
    $('#userpage').show();
    break;
  case "Advanced Search":
    $('.container').hide();
    $('#mainbar').show();
    $('#advsearchpage').show();
    break;
  case "Search Results":
    $('.container').hide();
    $('#mainbar').show();
    $('#results').show();
    break;
  case "Art Piece":
    $('.container').hide();
    $('#mainbar').show();
    $('#artpiecepage').show();
    break;
   case "New User":
    $('.container').hide();
    $('#newaccount').show();
    break;
   case "Home":
    $('.container').hide();
    $('#login').show();
    break;
  }
}

// Build output table from comma delimited data list from the server (art pieces)
  function buildTable(data) {
    rows=JSON.parse(data);
    if (rows.length < 1) {
      return "<h3>No matches found</h3>";
    } else {
      var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><tr>';
      if(rows.length==1) {
        result += "<tr><td>1 piece found<td><td></td></tr>";
      }
      if(rows.length>1) {
        result += "<tr><td>"+rows.length+" pieces found<td><td></td></tr>";
      }
      var i=0
      rows.forEach(function(row) {
        result += "<tr><td class='art' id='"+row.ID+"'><img id='to-piece' style='width: 30vw; min-width: 100px;' src='"+row.IMGURL+"'</td><td class='title' id='to-piece'>"+row.Title+"</td><td class='artist'>"+row.Author+"</td>";
      })
      result += "</table>";

      return result;
    }
  }

//build data table based on data from server (usernames)
  function buildUserTable(data){
    rows=JSON.parse(data);
    if (rows.length < 1) {
      return "<h3>No matches found</h3>";
    } else {
      var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><tr>';
        //result += "<tr><td>"+rows.length+" pieces found<td><td></td></tr>";
      var i=0
      rows.forEach(function(row) {
        result += "<tr><td class='username link' id='"+row.ID+"'>"+row.username+"</td></tr>";
      })
      result += "</table>";

      return result;
    }
  }

  function loadPiece(data){
    var rows = JSON.parse(data); //wants it to be like this even though there's only one row

    $.ajax({
      url: Url+'/piecefavs?pieceid='+rows[0].ID,
      type:"GET",
      success: countFavs,
      error: displayError
    });

    $.ajax({
      url: Url+'/checkfav?username='+thisUser+'&pieceid='+rows[0].ID,
      type:"GET",
      success: userFav,
      error: displayError
    });

    $.ajax({
      url: Url+'/getuserreview?pieceID='+rows[0].ID+'&user='+thisUser,
      type:"GET",
      success: userReview,
      error: displayError
    })

    rows.forEach(function(row) {
      $('#artpiecepage').find('#piece').attr('src', row.IMGURL);
      $('#artpiecepage').find('.pieceid').attr('id', row.ID); //embed piece id in page (invisibly)

      $('#art-info-table').empty();
      $('#art-info-table').append('<table class="art-table"><tr><td>Title: </td><td>'+row.Title+'</td></tr>');
      $('#art-info-table').append('<tr><td>Author: </td><td>'+row.Author+'</td></tr>');
      $('#art-info-table').append('<tr><td>Born-Died: </td><td>'+row.BornDied+'</td></tr>');
      $('#art-info-table').append('<tr><td>Date: </td><td>'+row.Date+'</td></tr>');
      $('#art-info-table').append('<tr><td>Technique: </td><td>'+row.Technique+'</td></tr>');
      $('#art-info-table').append('<tr><td>Location: </td><td>'+row.Location+'</td></tr>');
      $('#art-info-table').append('<tr><td>Form: </td><td>'+row.Form+'</td></tr>');
      $('#art-info-table').append('<tr><td>Type: </td><td>'+row.Type+'</td></tr>');
      $('#art-info-table').append('<tr><td>School: </td><td>'+row.School+'</td></tr>');
      $('#art-info-table').append('<tr><td>Timeframe: </td><td>'+row.Timeframe+'</td></tr></table>');
    });

  }

  function displayError(error) {
    console.log('Error ${error}');
  }

  // Clears the search results area on the screen
  function clearResults() {
    $('#searchresults').empty();
  }

  // Called when the user hits the "Search" button.
  // It sends a request to the server (operation,search string),
  // Where operation is one of (Last, First, Type)
  function getMatches(search){
    console.log($(".dropdown-menu li a").text());//// DEBUG

    if($("#searchtype").text()=="User Search"){
      $.ajax({
        url: Url+'/finduser?search='+search,
        type:"GET",
        success: processUserResults,
        error: displayError
      })
    }

    else{
      $.ajax({
        url: Url+'/find?search='+search,
        type:"GET",
        success: processResults,
        error: displayError
      })
    }
  }

  function getLogin(){
    console.log("Attepted log in by username:"+$('#username').val());
    $.ajax({
      url: Url+'/getlogin?username='+$('#username').val(),
      type:"GET",
      success: doLogin,
      error: displayError
    })
  }

  function doLogin(results){
    var userLog = JSON.parse(results); //wants it to be like this even though there's only one row
    console.log("User " + userLog[0].username + " password is " + userLog[0].password);
    if(userLog.length == 0){
      console.log("bad user");
      $('#login-err').show()
    } else {
      if(userLog[0].password == $('#password').val()){
        console.log($('#username').val()+" logged in");
        thisUser=$('#username').val(); //set who the logged in user is
        changeState("Main");
        //Gets user bio uppon succeful login
        getBio();
        console.log(thisBio)
      }
      else{
        console.log("bad password");
        $('#login-err').show()
      }
    }
  }

  function checkUser(){
    //verify username is not a duplicate/doesn't already exists in database
    console.log("Verify username:"+$('#addUserName').val());
    $.ajax({
      url: Url+'/checkuser?username='+$('#addUserName').val(),
      type:"GET",
      success: addUser,
      error: displayError
    })
  }

  function addUser(results){
    let count = JSON.parse(results);

    if(count[0].count==0){
      //no users by that name
      console.log("Add:"+$('#addUserName').val());

      $.ajax({
          url: Url+'/adduser?username='+$('#addUserName').val()+'&password='+$('#addPassword').val(),
          type:"GET",
          success: processUser,
          error: displayError
        })
      }
    else{
      console.log("duplicate username");
      $('#signup-err').show();
      }
  }
//function to add bio
  function addBio(results){
    $.ajax({
        url: Url+'/addBio?bio='+$('#bioEnter').val()+'&username='+thisUser,
        type:"GET",
        success: processAddBio,
        error: displayError
      })
    }

  function getBio(results){
    console.log("Got Here")
    $.ajax({
        url: Url+'/getBio?username='+thisUser,
        type:"GET",
        success: processGetBio,
        error: displayError
      })
    }


  function processGetBio(results){
    var bioLog = JSON.parse(results);
    console.log(bioLog);
    console.log("Bio " + bioLog[0].bio);
    thisBio = bioLog[0].bio
    console.log(thisBio)

  }

  function processAddBio(results){
    console.log("bioAdded")
  }



  function processFav(results)
  {
    console.log('fav change');
    //TODO: what needs to be done here??
  }

  function countFavs(results)
  {
    let favs = JSON.parse(results)[0].count;
    console.log(favs);
    $('#numfavs').text("Favorites:" + favs); //shows the number of people who have favorited this
  }

  function userFav(results)
  {
    let faved = JSON.parse(results)[0].count;
    console.log(faved);
    const emptyHeart = "\u2661";
    const fullHeart = "\u2665";

    console.log($('#fav').html());

    if(faved > 0) {
      $('#fav').html(fullHeart);
    } else {
      $('#fav').html(emptyHeart);
    }

  }

  function getPiece(id){
    $.ajax({
      url: Url+'/getpiece?search='+id,
      type:"GET",
      success: loadPiece,
      error: displayError
    })
  }

/********* Review calls **********/
  function userReview(results)
  {
    $('#reviewEnter').val('');
    var rev = JSON.parse(results)[0]; //gets info on what should be only one matching review
    if (rev == undefined){}
    else {
      console.log(rev.review);// DEBUG
      $('#reviewEnter').val(rev.review);
    }
  }

  function addReview(id){
    $.ajax({
      url: Url+'/addreview?pieceID='+id+'&user='+thisUser+'&review='+$('#reviewEnter').val(),
      type:"GET",
      success: reviewAdded,
      error: displayError
    })
  }
  function reviewAdded(results)
  {
    console.log("review added");

  }

/********* Profile calls **********/
  function getProfile(username){
    $.ajax({
      url: Url+'/getuser?search='+username,
      type:"GET",
      success: loadProfile,
      error: displayError
    })
  }

//STILL DRAFT
  function loadProfile(data){
    var rows = JSON.parse(data);
    console.log(rows);// DEBUG

    var result = "<h3>Currently no favorite pieces</h3>";
    if (rows.length > 0) {
      var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><tr>';
      var i=0
      rows.forEach(function(row) {
        result += "<tr><td class='art' id='"+row.ID+"'><img id='to-piece' style='width: 30vw; min-width: 100px;' src='"+row.IMGURL+"'</td><td class='title' id='to-piece'>"+row.Title+"</td><td class='artist'>"+row.Author+"</td>";
      })
      result += "</table>";
    }

    $('#userfavs').append(result)

  }
