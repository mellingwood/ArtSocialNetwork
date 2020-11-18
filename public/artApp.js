// JavaScript for Phone Application Demo Program Using Express and REST
// Jim Skon, Kenyon College, 2020
const port='9020' // Must match port used on server, port>8000
const Url='http://jimskon.com:'+port
var pageState;	// page state
var selectid;
var recIndex
var rows;
var saveRecord; // Place to store record for add varification
// Set up events when page is ready
$(document).ready(function () {
  // For this program is will be a reponse to a request from this page for an action

  pageState = "Home"; // Default page

  // Clear everything on startup
  $('.loggedin').hide();
  $('#mainbar').hide();

  //make everything appear when you log in-- needs more hoops to jump through when we get the user functionality going, but works with just a click now
  $('#login-btn').click(function() {
    //reveal home page and mainbar
    pageState = "Main";
    changeState(pageState);
  });

  //reacts to both user search and art search the same right now
  $('#search-btn').click(function() {
    //reveal search results
    pageState = "Search Results";
    changeState(pageState);
    getMatches();
  });

  $("#clear").click(clearResults);

  //function to go to page specific page when they click on picture
  $('#results').on('click', '#to-piece', function(){
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
    //console.log("pick!"+operation);
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
  } else if (pageState=="Art Search"){
    $('#mainbar').show();
    $('#home').hide();
    $('#results').show();
    $('#artpiecepage').hide();
  } else if (pageState=="User Search"){
    //nothing for this yet
  } else if (pageState=="Search Results"){
    $('#mainbar').show();
    $('#home').hide();
    $('#results').show();
    $('#artpiecepage').hide();
  } else if (pageState=="Art Piece"){
    $('#mainbar').show();
    $('#home').hide();
    $('#results').hide();
    $('#artpiecepage').show();
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
      var i=0
      rows.forEach(function(row) {
        result += "<tr><td class='art' id='"+row.pieceid+"'><img id='to-piece' src='"+row.url+"</td><td class='title' id='to-piece'>"+row.title+"</td><td class='artist'>"+row.artist+"</td>";
      })
      result += "</table>";

      return result;
    }
  }

  function loadPiece(data){
    piece = JSON.parse(data);
    $('#artpiecepage').find('#piece').attr('src', piece.url)
    $('#artpiecepage').find('#title').text(piece.title);
    $('#artpiecepage').find('#artist').text(piece.author);
    $('#artpiecepage').find('#artist-info').text(piece.borndied);
    $('#artpiecepage').find('#date').text(piece.date);

    var tags = "<div id='tags'>";
    tags += "<span id='form'>" + piece.form + "</span>";
    tags += "<span id='technique'>" + piece.technique+ "</span>";
    tags += "<span id='location'>" + piece.location+ "</span>";
    tags += "<span id='type'>" + piece.type+ "</span>";
    tags += "<span id='school'>" + piece.school+ "</span>";
    tags += "<span id='timeframe'>" + piece.timeframe + "</span>";
    tags += "</div>";
    $('#artpiecepage').find('#tags').html(tags);mo
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

  // should be able to outsorce the ajax call for indv, peice page to this
  /*
  function gePiece(){
    var piece = $('#').val();
    $('#searchresults').empty();
    $.ajax({
      url: Url+'/getpiece?search='+$(this).attr('id'), //THIS LINE MAY BE WRONG
      type:"GET",
      success: loadPiece,
      error: displayError
    })

  }*/
