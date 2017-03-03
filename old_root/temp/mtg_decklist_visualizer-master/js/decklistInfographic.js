function decklistInfographic() {
  var margin_top = 185, margin_bottom = 50;
  var margin = 20,
      card_w = 223 * 1.0, card_h = 311 * 1.0,
      num_cols = 4;
      card_padding_x = 10,
      card_pile_padding_y = 34,
      maxPileCount = 4;

  var manaCurveChartSvg = undefined,
      manaCurveX = 0, manaCurveY = 0,
      colorPieChartSvg = undefined,
      colorPieX = 0, colorPieY = 0;

  function svgToImage(svgHtml, callback) {
    var image = new Image();
    image.src = "data:image/svg+xml;base64," + btoa(svgHtml);
    image.onload = callback;
  }

  function formatDeckDescription(description) {
    var maxDescriptionLength = 144;
    return description.substring(0, maxDescriptionLength).split("\n");
  }

  function cloneObject(object) {
    // http://heyjavascript.com/4-creative-ways-to-clone-objects/
    return (JSON.parse(JSON.stringify(object)));
  }

  // Takes any stack of cards greater than 4 and splits
  // them into additional piles.
  function separatePiles(cards) {
    var splitCards = [];
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.count > maxPileCount) {
        // calculate how many mutliples of 4 we have
        // and the remainder
        var multiple = Math.ceil(card.count / maxPileCount),
            remainder = card.count % maxPileCount;

        // add each multiple of 4
        for (var j = 0; j < multiple; j++) {
          // clone the object.  this seems slow, but the internet said
          // to do it.
          var replicatedCard = cloneObject(card);
          replicatedCard.count = maxPileCount;
          splitCards.push(replicatedCard);
        }

        if (remainder > 0) {
          // add the remainder
          var replicatedCard = cloneObject(card);
          replicatedCard.count = remainder;
          splitCards.push(replicatedCard);         
        }
      }
      else {
        splitCards.push(card);
      }
    }
    return splitCards;
  }

  // performs in place sort based on mana cost.
  // sort ascending.
  function sortByManaCost(cards) {
    cards.sort(function(a, b) {
      return a.cmc - b.cmc;
    });
  }

  function sortDeckByCardType(cards) {
    // this is super hardcoded, but will only change
    // if wizards adds a new card type.
    var creature = [], planeswalker = [], artifact = [], instant = [], sorcery = [], enchantment = [], land = [];
    cards.forEach(function(d, i) {
      if (d.types) {
        var type = d.types[0];
        if (type === "creature") {
          creature.push(d);
        } else if (type === "planeswalker") {
          planeswalker.push(d);
        } else if (type === "artifact") {
          artifact.push(d);
        } else if (type === "instant") {
          instant.push(d);
        } else if (type === "sorcery") {
          sorcery.push(d);
        } else if (type === "enchantment") {
          enchantment.push(d);
        } else if (type === "land") {
          land.push(d);
        }
      }
    });

    sortByManaCost(creature);
    sortByManaCost(planeswalker);
    sortByManaCost(artifact);
    sortByManaCost(instant);
    sortByManaCost(sorcery);
    sortByManaCost(enchantment);
    sortByManaCost(land);

    return creature.concat(planeswalker).concat(artifact).concat(instant).concat(sorcery).concat(enchantment).concat(land);
  }
 
  function chart(selection) {
    selection.each(function(data) {
      var cards = separatePiles(data.cards);

      // sort the cards based on card type.
      if (data.bSortDeck) {
        cards = sortDeckByCardType(cards);
      }

      // number of rows is dependent on how many cards in total we
      // have and how many we can fit in a column.
      var num_rows = Math.ceil(cards.length / num_cols);

      // find the biggest card pile in each row
      // knowing how big each card pile will stack we
      // can determine the canvas size, and where each
      // row should be drawn.
      var rowMaxCardCounts = [];
      for (var i = 0; i < num_rows; i++) { rowMaxCardCounts.push(0); }
      for (var i = 0; i < cards.length; i++) {
        var r = Math.floor(i / num_cols);
        rowMaxCardCounts[r] = Math.max(cards[i].count, rowMaxCardCounts[r]);
      }

      var heightOfAllRows = 0;    // keep a running total of the height of all rows
      var rowPositionY = [];      // cache off where each row starts
      for (var i = 0; i < rowMaxCardCounts.length; i++) {
        rowPositionY.push(heightOfAllRows);
        heightOfAllRows += card_h + (rowMaxCardCounts[i] - 1) * card_pile_padding_y;
      }

      var canvas_w = (margin * 2) + (card_w * num_cols) + ((num_cols - 1) * card_padding_x),
          paddingBetweenRows = ((num_rows - 1) * card_padding_x),
          // the height of the canvas is the top and bottom margin,
          // the height of each row (which varies) and how much 
          // padding between all rows.
          canvas_h =  margin_top + margin_bottom + heightOfAllRows + paddingBetweenRows;

      // precalculate where each card should be drawn to
      var cardLocations = [];
      for (var i = 0; i < cards.length; i++) {
        var c = i % num_cols, r = Math.floor(i / num_cols);
        cardLocations[i] = {
          x: (margin + card_w * c) + card_padding_x * c,
          y: (margin_top + rowPositionY[r]) + (card_padding_x * r)
        };
      }
      
      // create canvas and context
      var canvas = d3.select(this).append("canvas")
          .attr("width", canvas_w)
          .attr("height", canvas_h)
          .attr("id", "infographic");
      var ctx = canvas.node().getContext("2d");

      // fill with white.
      ctx.fillStyle = "rgb(251, 250, 245)";
      ctx.fillRect(0, 0, canvas_w, canvas_h);

      // draw a border
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(0, 0, canvas_w, canvas_h);

      // draw the deck name to the canvas
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.font = "bold 48px Lato";
      ctx.fillText(data.name, margin, 50);

      // draw the deck description
      var descriptionStartY = 75, fontHeight = 12, descriptionIndent = 0;
      var descriptionX = margin + descriptionIndent;
      ctx.fillStyle = "rgb(128, 130, 133)";
      ctx.font = fontHeight + "px Lato";

      var maxDescriptionLines = 3;
      var formattedDescription = formatDeckDescription(data.description);
      // truncate the array to maxDescriptionLines
      formattedDescription.splice(maxDescriptionLines, formattedDescription.length - maxDescriptionLines);
      for (var i = 0; (i < formattedDescription.length); i++) {
        ctx.fillText(formattedDescription[i], descriptionX, descriptionStartY + fontHeight * i);
      }

      // draw the legal stuff at the bottom
      ctx.font = "10px Lato";
      ctx.fillText("Wizards of the Coast, Magic: The Gathering, and their logos are trademarks of Wizards of the Coast LLC. © 1995-2015 Wizards.",
                   5, canvas_h - 5);

      ctx.font = "16px Lato";
      ctx.fillStyle = "#66757F";
      ctx.fillText("@MTGDeckScry", canvas_w - 130, canvas_h - 12);

      var paddingTop = 15;
      // draw svg image to the canvas.
      if (manaCurveChartSvg !== undefined) {
        svgToImage(manaCurveChartSvg, function() {
          ctx.drawImage(this, canvas_w - colorPieX - manaCurveX - margin * 2, paddingTop);
        });
      }

      if (colorPieChartSvg !== undefined) {
        svgToImage(colorPieChartSvg, function() {
          ctx.drawImage(this, canvas_w - colorPieX - margin, margin);
        });
      }
      
      var imageLoadCount = 0;
      var images = new Array(cards.length);
      
      var drawImagesCallback = function() {
        images.forEach(function(image, i) {
          var p = cardLocations[i];
          // draw the pile of cards
          for (var j = 0; j < cards[i].count; j++) {
            ctx.drawImage(image, p.x, p.y + j * card_pile_padding_y, card_w, card_h);            
          }

          // draw black rect to hack around the fact that some jpegs have white corners
          var bw = 9 // border width
          ctx.fillStyle = "black";
          // draw a rect going down the left side of the card
          ctx.fillRect(p.x, p.y + bw, bw, card_pile_padding_y * maxPileCount);
          // draw a rect going down the right side of the card
          ctx.fillRect(p.x + card_w - bw, p.y + bw, bw, card_pile_padding_y * maxPileCount);
        });
      };
      
      // for each unique card in the deck fetch its image.
      cards.forEach(function(card, i) {
        images[i] = new Image();
        images[i].src = card.gathererURL;
        images[i].onload = function() {
          // draw all the images once we load the last one.
          if (++imageLoadCount === images.length) { drawImagesCallback(); }
        }
      });
      
    });
  }

  chart.manaCurve = function(manaCurveSvg, x, y) {
    manaCurveChartSvg = manaCurveSvg;
    manaCurveX = x;
    manaCurveY = y;
    return chart;
  }

  chart.colorPie = function(colorPieSvg, x, y) {
    colorPieChartSvg = colorPieSvg;
    colorPieX = x;
    colorPieY = y;
    return chart;
  }

  return chart;
}