
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