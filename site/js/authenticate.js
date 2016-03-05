var authSuccess = function() { 
  isAuthenticated = true;
  console.log("Successful authentication"); 
};

var authFailure = function() { 
  isAuthenticated = false;
  console.log("Failed authentication");
};

var authenticate = function() {
  Trello.authorize({
    type: "redirect",
    name: "FefeTrialApp",
    scope: {
      read: true,
      write: false },
    expiration: "1hour",
    persist: false,
    success: authSuccess,
    error: authFailure
  });
};