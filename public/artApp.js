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
  $('.editdata').hide();
  $("#search-btn").click(getMatches);  // Search button click

  //$("#add-btn").click(addEntry);
  $("#clear").click(clearResults);

  $('div').on('click', '#to-piece', loadPiece());
  //not sure if 'div' is the right object

  //Handle pulldown menu
  $(".dropdown-menu li a").click(function(){
    $(this).parents(".btn-group").find('.selection').text($(this).text());
    operation=$(this).text().split(" ").first();  // Get first word (User or Art)
    //console.log("pick!"+operation);
    changeOperation(operation);
  });

  $('.completeDelete').click(processDelete);

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
  $(".edit").click(processEdit);
  $(".delete").click(DeleteConfirm);

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
        result += "<tr><td class='art'><img id='to-piece' src='"+row.url+"</td><td class='title' id='to-piece'>"+row.title+"</td><td class='artist'>"+row.artist+"</td>";
        //result += "<td><button type='button' ID='"+row.ID+"' class='btn btn-primary btn-sm edit'>Edit</button> ";
        //result += "<button type='button' ID='"+row.ID+"' Index='"+i+"' class='btn btn-primary btn-sm delete'>Delete</button></td></tr>";
        //i++;
      })
      result += "</table>";

      return result;
    }
  }

  function loadPiece(){
    $('.editdata').hide();
    $('.inputdata').hide();
    $('.results').hide();
    $('.searchbox').show();
    //need an express call or something to display piece
    //$('.artpage').find('.img').src(message.url);
    $('.artpage').show();
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
