// JavaScript for Phone Application Demo Program Using Express and REST
// Jim Skon, Kenyon College, 2020
const port='9020' // Must match port used on server, port>8000
const Url='http://jimskon.com:'+port
var pageState;	// page state
var selectid;
var recIndex
var rows;
var thisUser;

// Set up events when page is ready
$(document).ready(function () {
  // For this program is will be a reponse to a request from this page for an action

  pageState = "Home"; // Default page

  // Clear everything on startup
  $('.loggedin').hide();
  $('#login-err').hide();
  $('#mainbar').hide();
  $('#newaccount').hide();

  //make everything appear when you log in-- needs more hoops to jump through when we get the user functionality going, but works with just a click now
  $('#login-btn').click(function() {
    $('#login-err').hide();
    getLogin();
  });

  $('#newaccount-btn').click(function() {
    //bring to sign up page
    pageState = "New User";
    changeState(pageState);
  });

  $('#cancel-btn').click(function() {
    //cancel sign up
    console.log("cancel!");
    $('#addUserName').val('')
    $('#addPassword').val('')
    pageState = "Home";
    changeState(pageState);
  });

  $('#signup-btn').click(function() {
    $('#signup-err').hide()
    checkUser();
    /*pageState = "Home";
    changeState(pageState);*/
    //moved to addUser()
  });

  //reacts to both user search and art search the same right now
  $('#search-btn').click(function() {
    //make an error pop up if there is no search term to avoid pulling up all pieces and taking a really long time

    var search = $('#search').val();

    if(search != "") {
      //reveal search results
      pageState = "Search Results";
      changeState(pageState);
      getMatches();
    } else {
      $('#searchresults').html('<div class="modal" id="myModal"><div class="modal-dialog"><div class="modal-content"><!-- Modal Header --><div class="modal-header"><h4 class="modal-title">Modal Heading</h4><button type="button" class="close" data-dismiss="modal">&times;</button></div><!-- Modal body --><div class="modal-body">Modal body..</div><!-- Modal footer --><div class="modal-footer"><button type="button" class="btn btn-danger" data-dismiss="modal">Close</button></div></div></div></div>');
    }
  });

  //sends user to their own page
  $('#profile-btn').click(function() {
    pageState = "User Profile";
    changeState(pageState);
    $('#userpageName').empty();
    $('#userpageName').append(thisUser);
  });

  $("#clear").click(clearResults);

  //function to go to page specific page when they click on picture
  $('#results').on('click', '.art', function(){
    //reveal individual art piece page
    pageState = "Art Piece";
    changeState(pageState);
    $.ajax({
      url: Url+'/getpiece?search='+$(this).attr('id'), //THIS LINE MAY BE WRONG
      type:"GET",
      success: loadPiece,
      error: displayError
    })
  });
  //This will link the search results to the art pages

  //Handle pulldown menu
  $(".dropdown-menu li a").click(function(){
    $(this).parents(".btn-group").find('.selection').text($(this).text());
    pageState=$(this).text() //sets page state by drop down choice // can use .split(" ").first(); to g et first word (User or Art)
    changeState(pageState);
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
  pageState = "Main";
  changeState(pageState);
}

// This function is called when an option is selected in the pull down menu
// If the option is "Add New" the shows the add form, and hides the others
// Otherwise it shows the results div
function changeState(pageState) {
  //show/hide divs to make the website "be" that page / be in that state
  if(pageState=="Main"){
    $('#login').hide(); //get rid of login stuff
    $('#mainbar').show();
    $('.loggedin').show(); //allow logged in stuff to be shown...
    $('#results').hide(); //but hide everything but home page
    $('#artpiecepage').hide();
    $('#newaccount').hide();
    $('#userpage').hide();
  } else if (pageState=="Art Search"){
    $('#mainbar').show();
    $('#home').hide();
    $('#results').show();
    $('#artpiecepage').hide();
    $('#newaccount').hide();
    $('#userpage').hide();
  } else if (pageState=="User Search"){
    //nothing for this yet
  } else if (pageState=="User Profile"){
    $('#mainbar').show();
    $('#home').hide();
    $('#results').hide();
    $('#artpiecepage').hide();
    $('#newaccount').hide();
    $('#userpage').show();
  } else if (pageState=="Search Results"){
    $('#mainbar').show();
    $('#home').hide();
    $('#results').show();
    $('#artpiecepage').hide();
    $('#newaccount').hide();
    $('#userpage').hide();
  } else if (pageState=="Art Piece"){
    $('#mainbar').show();
    $('#home').hide();
    $('#results').hide();
    $('#artpiecepage').show();
    $('#newaccount').hide();
    $('#userpage').hide();
  } else if (pageState == "New User"){
    $('#login').hide();
    $('#mainbar').hide();
    $('#home').hide();
    $('#results').hide();
    $('#artpiecepage').hide();
    $('#newaccount').show();
    $('#signup-err').hide();
    $('#userpage').hide();
  } else if (pageState == "Home"){
    $('#login').show();
    $('#mainbar').hide();
    $('#home').hide();
    $('#results').hide();
    $('#artpiecepage').hide();
    $('#newaccount').hide();
    $('#userpage').hide();
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

    var tags = "<div id='tags'>";

    rows.forEach(function(row) {
      $('#artpiecepage').find('#piece').attr('src', row.IMGURL)
      $('#artpiecepage').find('#title').text(row.Title);
      $('#artpiecepage').find('#artist').text(row.Author);
      $('#artpiecepage').find('#artist-info').text(row.borndied);
      $('#artpiecepage').find('#date').text(row.Date);

      tags += "<span id='form'>  " + row.Form + "  </span>";
      tags += "<span id='technique'>  " + row.Technique+ "  </span>";
      tags += "<span id='location'>  " + row.Location+ "  </span>";
      tags += "<span id='type'>  " + row.Type+ "  </span>";
      tags += "<span id='school'>  " + row.School+ "  </span>";
      tags += "<span id='timeframe'>  " + row.Timeframe + "  </span>";
      tags += "</div>";
      $('#artpiecepage').find('#tags').html(tags);
    })

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
        pageState="Main";
        changeState(pageState);
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
      var saveRecord=$('#addUserName').val()+' '+$('#addPassword').val()
        // Place to store record for add varification
        //I'm not sure if we need this? -Andy

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
