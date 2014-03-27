
  String.prototype.addCommas = function() {
    x = this.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }

  String.prototype.parseFloat = function() {
    var flo = parseFloat(this);
    var l = (~~flo).toString().length;
    var x = l < 7 ? 3 : 1;
    var c = flo.toFixed(x);
    return c.toString().addCommas();
  }

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  String.prototype.getParameters = function() {
    var vars = [], hash;
    var hashes = this.slice(this.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

  String.prototype.getParameterValue = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(this);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }