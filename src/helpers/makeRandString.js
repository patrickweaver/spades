module.exports = (stringLength) => {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //var characters = "abcdefghijklmnopqrstuvwxyz";
  for( var i=0; i < stringLength; i++ )
      randString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randString;
}