// JavaScript for Phone Application Demo Program Using Express and REST
// Jim Skon, Kenyon College, 2020
const port='9020' // Must match port used on server, port>8000
const Url='http://jimskon.com:'+port
var operation;	// operation
var selectid;
var recIndex
var rows;
var saveRecord; // Place to store record for add varification
// Set up events when page is ready
$(document).ready(function () {
  // For this program is will be a reponse to a request from this page for an action

  operation = "Art"; // Default operation

  // Clear everything on startup
  $('.loggedin').hide();
  $('#mainbar').hide();

  //make everything appear when you log in-- needs more hoops to jump through when we get the user functionality going, but works with just a click now
  $('#login-btn').click(function() {
    //reveal home page and mainbar
    $('#login').hide(); //get rid of login stuff
    $('#mainbar').show();
    $('.loggedin').show(); //allow logged in stuff to be shown...
    $('#results').hide(); //but hide everything but home page
    $('#artpiecepage').hide();



  });

  $('#search-btn').click(function() {
    $('#home').hide(); //hide all the other stuff
    //getMatches();
    //show search results page
    $('#results').show();
  });

  $("#clear").click(clearResults);

  $('#results').on('click', '#to-piece', function(){
    $('.editdata').hide();
    $('.inputdata').hide();
    $('.results').hide();
    $('.searchbox').show();
    $.ajax({
      url: Url+'/getpiece?search='+$(this).attr('id'), //THIS LINE MAY BE WRONG
      type:"GET",
      success: loadPiece,
      error: displayError
    })
    $('#artpiecepage').show();
  });
  //This will link the search results to the art pages

  //Handle pulldown menu
  $(".dropdown-menu li a").click(function(){
    $(this).parents(".btn-group").find('.selection').text($(this).text());
    operation=$(this).text().split(" ").first();  // Get first word (User or Art)
    //console.log("pick!"+operation);
    changeOperation(operation);
  });

});

// This processes the results from the server after we have sent it a lookup request.
// This clears any previous work, and then calls buildTable to create a nice
// Table of the results, and pushes it to the screen.
// The rows are all saved in "rows" so we can later edit the data if the user hits "Edit"
function processResults(results) {
  $('#editmessage').empty();
  $('#addmessage').empty();
  //console.log("Results:"+results);
  $('#searchresults').empty();
  $('#searchresults').append(buildTable(results));
}
changeOperation(operation);

// This function is called when an option is selected in the pull down menu
// If the option is "Add New" the shows the add form, and hides the others
// Otherwise it shows the results div
function changeOperation(operation){
  if(operation=="Art"){
    $('#addmessage').val("");
    $('.inputdata').show();
    $('.searchbox').hide();
    $('.results').hide();
    $('.editdata').hide();}
    else if (operation=="User"){
      $('.editdata').hide();
      $('.inputdata').hide();
      $('.results').show();
      $('.searchbox').show();
    }
  }

  function changeState(state) {
    //show/hide divs to make the website "be" that page / be in that state
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
    $('.editdata').hide();
    var search = $('#search').val();
    $('#searchresults').empty();
    $.ajax({
      url: Url+'/find?search='+search,
      type:"GET",
      success: processResults,
      error: displayError
    })

  }
