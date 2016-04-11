$(function() {
  var input = $("input#equation"), visual = $("div#visual"), outcome = $("div#outcome"), chart = $("table#chart");
  input.keyup(function() {
    for(var i = 0, equation = $(this).val(), reactants = equation.split("->")[0].split("+"), allElements = {}, max = 0; i < reactants.length; i++) {
      for(var j = 0, coefficient = parseInt(reactants[i].match(/^\d+/)) || 1, elements = reactants[i].match(/[A-Z][a-z]{0,2}\d*/g); j < elements.length; j++) {
        var symbol = elements[j].match(/[A-Za-z]+/);
        var atoms = parseInt(elements[j].match(/\d+/)) || 1;
        if(allElements[symbol] == undefined)
          allElements[symbol] = { reactants: 0, products: 0 };
        allElements[symbol].reactants += coefficient * atoms;
        if(allElements[symbol].reactants > max)
          max = allElements[symbol].reactants;
      }
    }
    for(var i = 0, products = equation.split("->")[1].split("+"); i < products.length; i++) {
      for(var j = 0, coefficient = parseInt(products[i].match(/^\d+/)) || 1, elements = products[i].match(/[A-Z][a-z]{0,2}\d*/g); j < elements.length; j++) {
        var symbol = elements[j].match(/[A-Za-z]+/);
        var atoms = parseInt(elements[j].match(/\d+/)) || 1;
        if(allElements[symbol] == undefined)
          allElements[symbol] = { reactants: 0, products: 0 };
        allElements[symbol].products += coefficient * atoms;
        if(allElements[symbol].products > max)
          max = allElements[symbol].products;
      }
    }
    var err = 0, sorted = Object.keys(allElements).sort();
    $(".elem").each(function() {
      if(sorted.indexOf($(this).attr("id")) == -1)
        $(this).remove();
      else if(allElements[$(this).attr("id")].reactants == 0 || allElements[$(this).attr("id")].products == 0)
        $(this).remove();
    });
    for(var i = 0; i < sorted.length; i++) {
      if($(".elem#" + sorted[i]).length == 1) {
        $(".elem#" + sorted[i] + " div.length:first").css("width", "calc(100%/" + max/allElements[sorted[i]].reactants + ")");
        $(".elem#" + sorted[i] + " div.length:last").css("width", "calc(100%/" + max/allElements[sorted[i]].products + ")");
      } else {
        chart.append("<tr id='" + sorted[i] + "' class='elem'><td>" + sorted[i] + "</td><td><table><tr><td><div class='length reactant' style='width:calc(100%/" + (max/allElements[sorted[i]].reactants) + ")'></div></td></tr><tr><td><div class='length product' style='width:calc(100%/" + (max/allElements[sorted[i]].products) + ")'></div></td></tr></table></td></tr>");
      }
      if(allElements[sorted[i]].reactants != allElements[sorted[i]].products)
        err = sorted[i] + " element not balanced.";
    }
    if(err) {
      outcome.text(err);
      outcome.addClass("error");
    } else {
      outcome.text("Balanced");
      outcome.removeClass("error");
    }
  });
  input.keyup();

  /*input.keyup(function() {
  	if(!/^(\d*([A-Z][a-z]{0,2}\d*)+)(\+\d*([A-Z][a-z]{0,2}\d*)+)*\-\>(\d*([A-Z][a-z]{0,2}\d*)+)(\+\d*([A-Z][a-z]{0,2}\d*)+)*$/.test($(this).val())) {
    	outcome.text("Incomplete");
      outcome.addClass("error");
      return;
    }
  	visual.empty();
    var equation = $(this).val();
    var reactants = equation.split("->")[0];
    var compounds = reactants.split("+");
    var allReactantElements = [];
    var coefficients = [];
    for(var i = 0; i < compounds.length; i++) {
      var coefficient = parseInt(compounds[i].match(/^\d+/)) || 1;
      coefficients.push(coefficient);
      var elements = compounds[i].match(/[A-Z][a-z]{0,2}\d*//*g);
      for(var j = 0; j < elements.length; j++) {
        var element = elements[j].match(/[A-Za-z]+/);
        var num = parseInt(elements[j].match(/\d+/)) || 1;
        if(allReactantElements[element] == undefined)
          allReactantElements[element] = 0;
        allReactantElements[element] += coefficient * num;
      }
    }
    var products = equation.split("->")[1];
    compounds = products.split("+");
    var allProductElements = [];
    for(var i = 0; i < compounds.length; i++) {
      var coefficient = parseInt(compounds[i].match(/^\d+/)) || 1;
      coefficients.push(coefficient);
      var elements = compounds[i].match(/[A-Z][a-z]{0,2}\d*//*g);
      for(var j = 0; j < elements.length; j++) {
        var element = elements[j].match(/[A-Za-z]+/);
        var num = parseInt(elements[j].match(/\d+/)) || 1;
        if(allProductElements[element] == undefined)
          allProductElements[element] = 0;
        allProductElements[element] += coefficient * num;
      }
    }
    var max = 0;
    for(var element in allReactantElements) {
    	if(allReactantElements[element] > max) {
      	max = allReactantElements[element];
      }
    }
    for(var element in allProductElements) {
    	if(allProductElements[element] > max) {
      	max = allProductElements[element];
      }
    }
    visual.append("<h3>REACTANTS</h3>");
    var sorted = Object.keys(allReactantElements).sort();
    for(var i = 0; i < sorted.length; i++) {
    	var element = sorted[i];
      visual.append(element + ": " + allReactantElements[element] + "<br /><div class='length' style='width:calc(100%/" + (max/allReactantElements[element]) + ")'></div><br>");
    }
    visual.append("<br /><h3>PRODUCTS</h3>");
    sorted = Object.keys(allProductElements).sort();
    for(var i = 0; i < sorted.length; i++) {
    	var element = sorted[i];
      visual.append(element + ": " + allProductElements[element] + "<br /><div class='length' style='width:calc(100%/" + (max/allProductElements[element]) + ")'></div><br>");
    }

    for(var element in allReactantElements) {
    	if(!allReactantElements.hasOwnProperty(element) || allReactantElements[element] != allProductElements[element]) {
      	outcome.text("One side has elements the other does not.");
        outcome.addClass("error");
      	return false;
      }
    }
    var factor = function(n) {
      for(var i = 2, factors = [0,0]; i <= n; i++, factors[i-1] = factors[i-1] || 0)
        if(n % i == 0)
          n /= i,
          factors[i---1]++;
      return factors;
    };
    var factors = [];
    for(var i = 0; i < coefficients.length; i++) {
    	factors[i] = factor(coefficients[i]);
    }
    for(var i = 0; i < coefficients.length; i++) {
    	for(var j = factors[i].length-1; j >= 1; j--) {
      	if(factors[i][j] == 0)
        	continue;
      	var commonFactor = true;
      	for(var k = 0; k < coefficients.length; k++) {
        	if(k == i)
          	continue;
          if(factors[k][j] == undefined || factors[k][j] == 0) {
          	commonFactor = false;
          }
        }
        if(commonFactor) {
          outcome.text("Not simplified: Common denominator of " + (j+1));
          outcome.addClass("error");
          return false;
        }
      }
    }
    outcome.text("Balanced");
    outcome.removeClass("error");
  });
  input.keyup();
  input.blur(function() {
  	if($(this).val() == "") {
    	$(this).val("2H2+O2->2H2O");
      $(this).keyup();
    }
  });*/
});
