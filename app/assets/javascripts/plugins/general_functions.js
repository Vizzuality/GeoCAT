function ucfirst(str,force){
  str=force ? str.toLowerCase() : str;
  return str.replace(/(\b)([a-zA-Z])/,
  function(firstLetter){
     return firstLetter.toUpperCase();
  });
}