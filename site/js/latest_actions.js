var getLatestActions = function() {
  if (!isAuthenticated) {
    authenticate();
  }

  console.log("CLICKED!")

  var actionsSuccess = function(successMsg) {
    console.log(successMsg.length)
    event_store = document.getElementById('myDiv')
    for (idx in successMsg) {
        event_store.appendChild(createNewEvent(successMsg[idx]))
    }
  }

  var actionsFailure = function(errorMsg) {
    asyncOutput(errorMsg);
  };

  var response = Trello.get('/members/me/actions',actionsSuccess, actionsFailure);  
}

var createNewEvent = function(eventObj) {
  var newDiv = document.createElement('div')
  newDiv.className = 'occur_date'
  var newContent = document.createTextNode(eventObj['date']); 
  newDiv.appendChild(newContent);
  return newDiv
}