// JavaScript for Phone Application Demo Program Using Express and REST
// Jim Skon, Kenyon College, 2020
const port='9020' // Must match port used on server, port>8000


const Url='http://jimskon.com:'+port
var selectid;
var recIndex
var rows;
var thisUser;

var socket = io.connect('http://jimskon.com:'+port);

// Set up events when page is ready
$(document).ready(function () {
  // For this program is will be a reponse to a request from this page for an action

  // Clear everything on startup
  $('.loggedin').hide();
  $('#login-err').hide();
  $('#mainbar').hide();
  $('#newaccount').hide();
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

  //reacts to both user search and art search the same right now
  $('#search-btn').click(function() {
    //make an error pop up if there is no search term to avoid pulling up all pieces and taking a really long time

    var search = $('#search').val();

    if(search != "") {
      //reveal search results
      changeState("Search Results");
      getMatches();
    } else {
      $('#searchresults').html('<div class="modal" id="myModal"><div class="modal-dialog"><div class="modal-content"><!-- Modal Header --><div class="modal-header"><h4 class="modal-title">Modal Heading</h4><button type="button" class="close" data-dismiss="modal">&times;</button></div><!-- Modal body --><div class="modal-body">Modal body..</div><!-- Modal footer --><div class="modal-footer"><button type="button" class="btn btn-danger" data-dismiss="modal">Close</button></div></div></div></div>');
    }
  });

  //sends user to their own page
  $('#profile-btn').click(function() {
    changeState("User Profile");
    $('#userpageName').empty();
    $('#userpageName').append(thisUser);
  });

  //sends user to their own page
  $('#adv-search-btn').click(function() {
    changeState("Advanced Search");
  });

  $("#clear").click(clearResults);

  //function to go to page specific page when they click on picture
  $('#results').on('click', '.art', function(){
    //reveal individual art piece page
    changeState("Art Piece");
    $.ajax({
      url: Url+'/getpiece?search='+$(this).attr('id'),
      type:"GET",
      success: loadPiece,
      error: displayError
    })
  });

  $('#fav').click (function(){
    console.log($('.pieceid').attr('id'));//debug
    $.ajax({
        url: Url+'/favorite?username='+thisUser+'&pieceid='+$('.pieceid').attr('id')+'&add='+!$(this).checked,
        type:"GET",
        success: processFav,
        error: displayError
      })
    });

  //Handle pulldown menu
  $(".dropdown-menu li a").click(function(){
    $(this).parents(".btn-group").find('.selection').text($(this).text());
    changeState($(this).text()); //change to dropdown selection
      //can use .split(" ").first(); to get first word (User or Art)
  });

});


////******** Functions not within document.ready **********//////


// This processes the results from the server after we have sent it a lookup request.
// This clears any previous work, and then calls buildTable to create a nice
// Table of the results, and pushes it to the screen.
// The rows are all saved in "rows" so we can later edit the data if the user hits "Edit"
function processResults(results) {
  //console.log("Results:"+results);
  $('#searchresults').empty();
  $('#searchresults').append(buildTable(results));
}

function processUser(results)
{
  thisUser=$('#addUserName').val(); //set who the logged in user is
  changeState("Main");
}

// This function is called when an option is selected in the pull down menu
// If the option is "Add New" the shows the add form, and hides the others
// Otherwise it shows the results div
function changeState(pageState) {
  switch(pageState){
  //show/hide divs to make the website "be" that page / be in that state
  case "Main":
    $('#mainbar').show();
    $('.loggedin').show(); //allow logged in stuff to be shown...
    $('.container').hide(); //but hide everything but home page
    $('#home').show();
    break;
  case "Art Search":
    $('.container').hide();
    $('#results').show();
    break;
  case "User Search":
    //nothing for this yet
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

  // Build output table from comma delimited data list from the server (a list of phone entries)
  //needs to be modified to become the "show search results for pieces" and separately become "show a piece of art and all its info"
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

  function loadPiece(data){
    var rows = JSON.parse(data); //wants it to be like this even though there's only one row

    $.ajax({
      url: Url+'/piecefavs?pieceid='+rows[0].ID,
      type:"GET",
      success: showFavs,
      error: displayError
    });

    rows.forEach(function(row) {
      $('#artpiecepage').find('#piece').attr('src', row.IMGURL);
      $('#artpiecepage').find('.pieceid').attr('id', row.ID); //embed piece id in page (invisibly)
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
  function getMatches(){
    var search = $('#search').val();
    $('#searchresults').empty();
    $.ajax({
      url: Url+'/find?search='+search,
      type:"GET",
      success: processResults,
      error: displayError
    })
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
      }
      else{
        console.log("bad password");
        $('#login-err').show()
      }
    }
  }

  function checkUser(){
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

  function processFav(results)
  {
    console.log('fav change');
    //TODO: what needs to be done here??
  }

  function showFavs(results)
  {
    let favs = JSON.parse(results)[0].count;
    console.log(favs);
    $('#fav').text("Favorites:" + favs); //not working, idk why
  }

  // should be able to outsorce the ajax call for indv, peice page to this
  /*
  function getPiece(){
    var piece = $('#').val();
    $('#searchresults').empty();
    $.ajax({
      url: Url+'/getpiece?search='+$(this).attr('id'), //THIS LINE MAY BE WRONG
      type:"GET",
      success: loadPiece,
      error: displayError
    })

  }*/
