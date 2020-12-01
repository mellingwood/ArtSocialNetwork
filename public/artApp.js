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
    $('#addUserName').val('');
    $('#addPassword').val('');
    changeState("Start");
  });

  $('#signup-btn').click(function() {
    $('#signup-err').hide();
    checkUser();
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
    changeState("User Profile");
    getProfile(thisUser);
  });

  //sends user to their advanced search page
  $('#adv-search-btn').click(function() {
    changeState("Advanced Search");
  });

  $('#do-adv-search-btn').click(function() {
    changeState("Search Results");
    clearResults();
    advancedSearch();
  });

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

  $('#featured').on('click', '.art', function(){
    //reveal individual art piece page
    changeState("Art Piece");
    getPiece($(this).attr('id'))
  });

  $('#results').on('click', '.username', function(){
    changeState("User Profile");
    getProfile($(this).text()); //use the username; id is too complicated
  });

  $('#userReviews').on('click','.username',function()
  {
    changeState("User Profile");
    getProfile($(this).text());
  });

  $('#fav').click (function(){
    const emptyHeart = "\u2661";
    const fullHeart = "\u2665";

    if($(this).html() == emptyHeart) {
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

////******** Functions not within document.ready **********//////


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

// This function shows and hides containers to change the state of the website
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
    $('#userpageName').text(thisUser);
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
    break;
    case "Start":
    // Clear everything on startup
    $('#mainbar').hide();
    $('#login').show();
    $('#login-err').hide();
    break;
  }
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
  });

  getReviews(rows[0].ID); //to populate reviews

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

///***User Logins/Registration****///

//user with account attempts to log in
function getLogin(){
  console.log("Attepted log in by username:"+$('#username').val());
  $.ajax({
    url: Url+'/getlogin?username='+$('#username').val(),
    type:"GET",
    success: doLogin,
    error: displayError
  });
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
      $('#login-err').show();
    }
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

///***Search functions***///

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
  var type = $('#type-select').text();

  if(title=="" && author=="" && school=="" && location=="" && date=="" && timeframe=="" && technique=="" && form=="Form" && type=="Type"){
    alert("No search terms entered. Please try again.");
  } else {
    $.ajax({
      url: Url+'/advanced?title='+title+'&author='+author+'&school='+school+'&location='+location+'&date='+date+'&timeframe='+timeframe+'&technique='+technique+'&form='+form+'&type='+type,
      type:"GET",
      success: processResults,
      error: displayError
    });
  }
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

///***Favorites calls**///
function processFav(results)
{
  console.log('fav change');
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

/********* Review calls **********/
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

/********* Profile calls **********/
function getProfile(username)
{
  getBio(username);
  getFavs(username);
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
    url: Url+'/getuserbio?search='+username,
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

///***Recommendations functions****///

function sendRec(sendto, comment, pieceid)
{
  console.log(sendto);
  console.log(pieceid);//debug lines
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

  var result = "<h3>No recommendations yet</h3>";
  if (rows.length > 0) {
    var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><tr>';
    var i=0;
    rows.forEach(function(row) {
      result += "<tr><td class='art' id='"+row.artpieceID+"'><img id='to-piece' style='width: 30vw; min-width: 100px;' src='"+row.IMGURL+"'</td><td class='title' id='to-piece'>"+row.Title+"</td><td class='artist'>"+row.Author+"</td>";
      result += "<td class='username link'>"+row.sendUser+"</td><td>"+row.message+"</td></tr>";
    });
    result += "</table>";
  }

  $('#recs-inbox').append(result);
}

//***Utility functions**/
function displayError(error) {
  console.log('Error ${error}');
}

// Clears the search results area on the screen
function clearResults() {
  $('#searchresults').empty();
}
