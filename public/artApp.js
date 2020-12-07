// JavaScript for Art Social Network Using Express and REST
// Team C, Kenyon College, 2020
const port='9020';
const Url='http://jimskon.com:'+port;
var selectid;
var recIndex;
var rows;
var thisUser;
var idList;

// Set up events when page is ready
$(document).ready(function () {
  runOncePerDay();
  // For this program is will be a reponse to a request from this page for an action
  getFeatured(localStorage.getItem('IDs'));
  changeState("Start");

/**** log in page functionality ****/
  $('#login-btn').click(function() {
    $('#login-err').hide();
    getLogin();
  });

  $('#newaccount-btn').click(function() {
    //bring to sign up page
    changeState("New User");
  });

  $('#cancel-btn').click(function() {
    $('#addUserName').val('');
    $('#addPassword').val('');
    changeState("Start");
  });

  $('#signup-btn').click(function() {
    $('#signup-err').hide();
    if($('#addUserName').val().includes("'"))
    {
      $('#input-err').show();
    } else{
      checkUser();
    }
  });

/**** task bar functionality ****/
  $('#smART').click(function(){
    changeState("Main")
  });
  //Handle search pulldown menu
  $(".dropdown-menu li a").click(function(){
    $(this).parents(".btn-group").find('.selection').text($(this).text());
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
      alert("No search term. Try again.");
    }
  });
  //sends user to their own profile
  $('#profile-btn').click(function() {
    $('#userpageName').text(thisUser);
    changeState("User Profile");
    getProfile(thisUser);
  });
  //sends user to their advanced search page
  $('#adv-search-btn').click(function() {
    changeState("Advanced Search");
  });

  //on the adv search page, actually sends the fields and does the search
  $('#do-adv-search-btn').click(function() {
    changeState("Search Results");
    clearResults();
    advancedSearch();
  });

  //make search results table have pagination rather than infinite scroll
  $('#search-results-table').DataTable();

/****** functions to go to piece specific page when they click on picture ****/
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

  $('#featured').on('click', '.art', function(){
    //reveal individual art piece page
    changeState("Art Piece");
    getPiece($(this).attr('id'));
  });

  $('#recs-inbox').on('click', '.art', function() {
    //reveal individual art piece page
    console.log("help"); //why isn't this even showing up????
    console.log($(this).attr('user')); //debug
    removeRec($(this).attr('user'),$(this).attr('id')); 
    changeState("Art Piece");
    getPiece($(this).attr('id'));
  });

/****** functions to go to user page when they click on usernames ****/
  $('#results').on('click', '.username', function(){
    $('#userpageName').text($(this).text());
    changeState("User Profile");
    getProfile($(this).text()); //use the username; id is too complicated
  });

  $('#userReviews').on('click','.username',function()
  {
    $('#userpageName').text($(this).text());
    changeState("User Profile");
    getProfile($(this).text());
  });

/****** art piece page functions ****/
  $('#fav').click (function(){
    const emptyHeart = "\u2661";
    const fullHeart = "\u2665";

    if($(this).html() == emptyHeart) {
      $(this).html(fullHeart);
      var addrem = 'add';}
    else if($(this).html() == fullHeart) {
      $(this).html(emptyHeart);
      var addrem = 'rem';}
      $.ajax({
        url: Url+'/favorite?username='+thisUser+'&pieceid='+$('.pieceid').attr('id')+'&addrem='+addrem,
        type:"GET",
        success: processFav,
        error: displayError
      });
  });

  $('#reviewEnter').keyup(function() {
    $('#review-success').hide();
  });

  $('#submitReview-btn').click(function() {
    var sendID = $('#artpiecepage').find('.pieceid').attr("id");
    console.log(sendID);
    addReview(sendID);
    $('#review-success').show();
  });

  $('#refresh-btn').click(function(){
    checkRecs(thisUser);
  });

});

/*********
"changes pages" using state switch
***********/

function changeState(pageState) {
  $('.container').hide();
  switch(pageState){
    case "Main":
    $('#mainbar').show();
    $('#home').show();
    break;
    case "User Profile":
    $('#userfavs').empty();
    $('#userpagebio').empty();
    $('#mainbar').show();
    $('#userpage').show();
    if($('#userpageName').text()!=thisUser)
    {
      console.log($('#userpageName').text());
      $('#myBtn').hide();
      $('#recs').hide();
    }
    else
    {
      $('#myBtn').show();
      $('#recs').show();
    }
    break;
    case "Advanced Search":
    $('#mainbar').show();
    $('#title-input').val('');
    $('#author-input').val('');
    $('#school-input').val('');
    $('#location-input').val('');
    $('#date-input').val('');
    $('#timeframe-input').val('');
    $('#technique-input').val('');
    $('#form-select').text("Form");
    $('#type-select').text("Type");
    $('#advsearchpage').show();
    break;
    case "Search Results":
    $('#mainbar').show();
    $('#results').show();
    $('#review-success').hide();
    break;
    case "Art Piece":
    $('#mainbar').show();
    $('#artpiecepage').show();
    $('#review-success').hide();
    break;
    case "New User":
    $('#newaccount').show();
    $('#signup-err').hide();
    $('#input-err').hide();
    break;
    case "Start":
    // Clear everything on startup
    $('#mainbar').hide();
    $('#login').show();
    $('#login-err').hide();
    break;
  }
}

/*********
modal code for recomendations and bios
***********/

//Sorry this is gross, ill make it one function but it's the only way I could get the modal working for now
var send_rec_button = document.getElementById("sendrec-btn");
var rec_modal = document.getElementById("rec-Modal");
send_rec_button.onclick = function() {
  var pieceID = $('#artpiecepage').find('.pieceid').attr("id");
  console.log("sending rec, piece: "+pieceID);
  sendRec($('#rec-target').val(), $('#rec-text').val(), pieceID);
  rec_modal.style.display = "none";
}

var modal = document.getElementById("myModal");
// Get the button that opens the modal
var btn = document.getElementById("myBtn");
var saveBio = document.getElementById("submitBio-btn")
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on the button, open the modal
// When the user clicks on <span> (x), close the modal
saveBio.onclick = function() {
  addBio($('#bioEnter').val());
  $('#userpagebio').empty();
  $('#userpagebio').append($('#bioEnter').val());
  console.log($('#bioEnter').val());
  $('#bioEnter').val('')
  modal.style.display = "none";
}

// This processes the results from the server after we have sent it a lookup request.
// This clears any previous work, and then calls buildTable to create a nice
// Table of the results, and pushes it to the screen.
// The rows are all saved in "rows" so we can later edit the data if the user hits "Edit"

//generates 9 random IDs and saves them to local storage
function randomIDs(){
  randIDs = []
  for(i = 0; i < 9;i++){
    randIDs[i] = Math.floor(Math.random() * 49568);
  }
  localStorage.setItem('IDs',randIDs.join())
  console.log(localStorage.getItem('IDs'))

}

//checks if a day has passed
function hasOneDayPassed(){
  // get today's date. eg: "7/37/2007"
  var date = new Date().toLocaleDateString();

  // if there's a date in localstorage and it's equal to the above:
  // inferring a day has yet to pass since both dates are equal.
  if( localStorage.yourapp_date == date )
  return false;

  // this portion of logic occurs when a day has passed
  localStorage.yourapp_date = date;
  return true;
}
//This function runs once a day, generates random IDs, and saves them to localStorage
function runOncePerDay(){
  if( !hasOneDayPassed() ) return false;
  randomIDs();
  console.log("A day has passed")
}

//Featured Pieces
function getFeatured(idList){
  $.ajax({
    url: Url+'/featured?idList='+localStorage.getItem('IDs'),
    type:"GET",
    success: processFeatured,
    error: displayError
  });
}

function processFeatured(results){
  $('#featured').append(buildFeatureTable(results));
}

function buildFeatureTable(data) {
  rows=JSON.parse(data);
  var result = '<div class="row">';
  result+='<div class="column">';
  var i=0;
  rows.forEach(function(row) {
    if(i == 3 || i == 6){
      result+='</div>';
      result+='<div class="column">';
    }
    result += "<img id='"+row.ID+"'style='width:100%' class = 'art' src='"+row.IMGURL+"'>";
    i++;
  })

  result += "</div></div>";
  return result;
}

/*********
single art piece functions
***********/

//Upon clicking a piece thumbnail, load the piece info
function getPiece(id){
  $.ajax({
    url: Url+'/getpiece?search='+id,
    type:"GET",
    success: loadPiece,
    error: displayError
  });
}

function loadPiece(data){
  var rows = JSON.parse(data);

  $.ajax({
    url: Url+'/piecefavs?pieceid='+rows[0].ID+'&username='+thisUser,
    type:"GET",
    success: countFavs,
    error: displayError
  });

/*
  $.ajax({
    url: Url+'/checkfav?username='+thisUser+'&pieceid='+rows[0].ID,
    type:"GET",
    success: userFav,
    error: displayError
  });
  */

  $.ajax({
    url: Url+'/getuserreview?pieceID='+rows[0].ID+'&user='+thisUser,
    type:"GET",
    success: userReview,
    error: displayError
  });

  getReviews(rows[0].ID); //to populate reviews

  rows.forEach(function(row) {
    $('#artpiecepage').find('#piece').attr('src', row.IMGURL);
    $('#artpiecepage').find('.pieceid').attr('id', row.ID); //embed piece id in page (invisibly)

    $('#art-info-table').empty();
    $('#art-info-table').append('<table class="art-table"><tr><td>Title: </td><td>'+row.Title+'</td></tr>');
    $('#art-info-table').append('<tr><td>Author: </td><td class="tag" id="Author">'+row.Author+'</td></tr>');
    $('#art-info-table').append('<tr><td>Born-Died: </td><td>'+row.BornDied+'</td></tr>');
    $('#art-info-table').append('<tr><td>Date: </td><td class="tag" id="Date">'+row.Date+'</td></tr>');
    $('#art-info-table').append('<tr><td>Technique: </td><td class="tag" id="Technique">'+row.Technique+'</td></tr>');
    $('#art-info-table').append('<tr><td>Location: </td><td class="tag" id="Location">'+row.Location+'</td></tr>');
    $('#art-info-table').append('<tr><td>Form: </td><td class="tag" id="Form">'+row.Form+'</td></tr>');
    $('#art-info-table').append('<tr><td>Type: </td><td class="tag" id="Type">'+row.Type+'</td></tr>');
    $('#art-info-table').append('<tr><td>School: </td><td class="tag" id="School">'+row.School+'</td></tr>');
    $('#art-info-table').append('<tr><td>Timeframe: </td><td class="tag" id="Timeframe">'+row.Timeframe+'</td></tr></table>');
  });

  //clicking on tag to get other pieces like this one
  $('.tag').click(function() {
    tagSearch($(this).attr("id"), $(this).text());
  });

  $('#rec-button').click(function() {
    $(this).modal();
  });

}

/*********
User Logins/Registration
***********/

//user with account attempts to log in
function getLogin(){
  console.log("Attepted log in by username:"+$('#username').val());
  $.ajax({
    url: Url+'/getlogin?username='+$('#username').val()+"&password="+$('#password').val(),
    type:"GET",
    success: doLogin,
    error: displayError
  });
}

function doLogin(results){
  var isValid = JSON.parse(results)[0].count; //wants it to be like this even though there's only one row

  if(isValid){
    console.log($('#username').val()+" logged in");
    thisUser=$('#username').val(); //set who the logged in user is
    changeState("Main");
  }
  else{
      console.log("bad password");
      $('#login-err').show();
    }
}

//for new users attempting to make an account
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
//add new user registration
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
    });
  }
  else{
    console.log("duplicate username");
    $('#signup-err').show();
  }
}

function processUser(results)
{
  thisUser=$('#addUserName').val(); //set who the logged in user is
  changeState("Main");
}

/*********
Search and advancedSearch functions
***********/

//called when user clicks "Search" button
function getMatches(search){

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
//called when user hits "Search" button on Advanced Search page
function advancedSearch(){
  var title = $('#title-input').val();
  var author = $('#author-input').val();
  var school = $('#school-input').val();
  var location = $('#location-input').val();
  var date = $('#date-input').val();
  var timeframe = $('#timeframe-input').val();
  var technique = $('#technique-input').val();
  var form = $('#form-select').text();
  if(form=="Form")//default value/no selection
  {
    form = "";
  }
  var type = $('#type-select').text();
  if(type=="Type")//default value/no selection
  {
    type = "";
  }

  if(title=="" && author=="" && school=="" && location=="" && date=="" && timeframe=="" && technique=="" && form=="" && type==""){
    alert("No search terms entered.");
  } else {
    $.ajax({
      url: Url+'/advanced?title='+title+'&author='+author+'&school='+school+'&location='+location+'&date='+date+'&timeframe='+timeframe+'&technique='+technique+'&form='+form+'&type='+type,
      type:"GET",
      success: processResults,
      error: displayError
    });
  }
}
//called when user clicks on a tag from a piece page to get other pieces with the same attribute
function tagSearch(field, term) {
  $.ajax({
    url: Url+'/tag?field='+field+'&term='+term,
    type:"GET",
    success: processResults,
    error: displayError
  });
  changeState("Search Results");
}

function processResults(results) {
  clearResults();
  $('#searchresults').append(buildArtTable(results));
}

// Build output table from server data (art pieces)
function buildArtTable(data) {
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

function processUserResults(results){
  clearResults();
  $('#searchresults').append(buildUserTable(results));
}
//build data table based on data from server (usernames)
function buildUserTable(data){
  rows=JSON.parse(data);
  if (rows.length < 1) {
    return "<h3>No matches found</h3>";
  } else {
    var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><tr>';
    var i=0;
    rows.forEach(function(row) {
      result += "<tr><td class='username link' id='"+row.ID+"'>"+row.username+"</td></tr>";
    })
    result += "</table>";

    return result;
  }
}

/*********
Profile calls
***********/

function getProfile(username)
{
  getBio(username);
  getFavs(username);
  checkRecs(username);
}

function addBio(results){
  $.ajax({
    url: Url+'/addBio?bio='+$('#bioEnter').val()+'&username='+thisUser,
    type:"GET",
    success: processAddBio,
    error: displayError
  });
}

function processAddBio(results){
  console.log("bio added");
}

function getBio(username)
{
  $.ajax({
    url: Url+'/getuserbio?username='+username,
    type:"GET",
    success: loadBio,
    error: displayError
  });
}

function loadBio(data){
  var rows = JSON.parse(data);

  var result = "This user's bio is empty.";
  if(rows.length > 0){
    var result = rows[0].bio;
  }

  $('#userpagebio').text(result);
}

function getFavs(username){
  $.ajax({
    url: Url+'/getuserfavs?search='+username,
    type:"GET",
    success: loadFavs,
    error: displayError
  });
}

function loadFavs(data){
  var rows = JSON.parse(data);

  var result = "<h3>Currently no favorite pieces</h3>";
  if (rows.length > 0) {
    var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><tr>';
    var i=0;
    rows.forEach(function(row) {
      result += "<tr><td class='art' id='"+row.ID+"'><img id='to-piece' style='width: 30vw; min-width: 100px;' src='"+row.IMGURL+"'</td><td class='title' id='to-piece'>"+row.Title+"</td><td class='artist'>"+row.Author+"</td>";
    });
    result += "</table>";
  }

  $('#userfavs').append(result);
}

/*********
Favorites
***********/

function processFav(results)
{
  console.log('fav change');
}

function countFavs(results)
{
  let favs = JSON.parse(results)[0].count;
  console.log(favs);
  $('#numfavs').text("Favorites:" + favs); //shows the number of people who have favorited this

  let faved = JSON.parse(results)[0].faved;
  const emptyHeart = "\u2661";
  const fullHeart = "\u2665";

  console.log($('#fav').html());

  if(faved) {
    $('#fav').html(fullHeart);
  } else {
    $('#fav').html(emptyHeart);
  }
}

/*********
Reviews
***********/

function getReviews(id){
  $.ajax({
    url: Url+'/getreviews?pieceID='+id,
    type:"GET",
    success: buildReviews,
    error: displayError
  });
}

function buildReviews(data){
  rows=JSON.parse(data);
  $('#userReviews').empty();
  if (rows.length < 1) {
    $('#userReviews').append('<p>No other reviews have been left</p>');
  } else {
    rows.forEach(function(row) {
      $('#userReviews').append('<h3 class="username link">User:'+row.user+'</h3>');
      $('#userReviews').append('<p>'+row.review+'</p>');
    });
  }
}

function userReview(results)
{
  $('#reviewEnter').val('');
  var rev = JSON.parse(results)[0]; //gets info on what should be only one matching review
  if (rev != undefined) {
    $('#reviewEnter').val(rev.review);
  }
}

function addReview(id){
  $.ajax({
    url: Url+'/addreview?pieceID='+id+'&user='+thisUser+'&review='+$('#reviewEnter').val(),
    type:"GET",
    success: reviewAdded,
    error: displayError
  });
}

function reviewAdded(results)
{
  console.log("review added");
  $('#review-success').show();
}

/*********
Recommendations functions
***********/

function sendRec(sendto, comment, pieceid)
{
  console.log(comment);//debug

  $.ajax({
    url: Url+'/sendrec?pieceid='+pieceid+'&user='+sendto+'&sender='+thisUser+'&comment='+comment,
    type:"GET",
    success: processSendRec,
    error: displayError
  });
}

function processSendRec(results)
{
  console.log("Recommendation sent.");
}

function checkRecs(username)
{
  $.ajax({
    url: Url+'/checkrec?username='+username,
    type:"GET",
    success: buildRecsTable,
    error: displayError
  });
}

function buildRecsTable(data)
{
  var rows = JSON.parse(data);

  $('#recs-inbox').empty();
  var result = "<h3>No recommendations yet</h3>";

  if (rows.length > 0) {
    var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><tr>';
    var i=0;
    rows.forEach(function(row) {
      result += "<tr><td class='art' id='"+row.artpieceID+"' user='"+row.sendUser+"'><img id='to-piece' style='width: 30vw; min-width: 100px;' src='"+row.IMGURL+"'</td><td class='title' id='to-piece'>"+row.Title+"</td><td class='artist'>"+row.Author+"</td>";
      result += "<td class='username link'>"+row.sendUser+"</td><td>"+row.message+"</td></tr>";
    });
    result += "</table>";
  }

  $('#recs-inbox').append(result);
}

function removeRec(sender, pieceid)
{
  console.log(sender, pieceid)
  $.ajax({
    url: Url+'/removerec?sender='+sender+'&receiver='+thisUser+'&pieceid='+pieceid,
    type:"GET",
    success: recRemoved,
    error: displayError
  });
}

function recRemoved(data)
{
  console.log("recommendation consumed.");
}

//***Utility functions**/
function displayError(error) {
  console.log('Error ${error}');
}

// Clears the search results area on the screen
function clearResults() {
  $('#searchresults').empty();
}
