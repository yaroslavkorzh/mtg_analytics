var deck = {
   "name":"L2P Black",
   "cards":[  
      {  
         "name":"Carnophage",
         "count":4,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Carnophage&type=card&.jpg",
         "types":[  
            "creature"
         ],
         "colors":[  
            "black"
         ],
         "cmc":1,
         "cost":"{B}"
      },
      {  
         "name":"Diregraf Ghoul",
         "count":4,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Diregraf%20Ghoul&type=card&.jpg",
         "types":[  
            "creature"
         ],
         "colors":[  
            "black"
         ],
         "cmc":1,
         "cost":"{B}"
      },
      {  
         "name":"Vampire Lacerator",
         "count":4,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Vampire%20Lacerator&type=card&.jpg",
         "types":[  
            "creature"
         ],
         "colors":[  
            "black"
         ],
         "cmc":1,
         "cost":"{B}"
      },
      {  
         "name":"Doom Blade",
         "count":4,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Doom%20Blade&type=card&.jpg",
         "types":[  
            "instant"
         ],
         "colors":[  
            "black"
         ],
         "cmc":2,
         "cost":"{1}{B}"
      },
      {  
         "name":"Nantuko Shade",
         "count":2,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Nantuko%20Shade&type=card&.jpg",
         "types":[  
            "creature"
         ],
         "colors":[  
            "black"
         ],
         "cmc":2,
         "cost":"{B}{B}"
      },
      {  
         "name":"Oona's Prowler",
         "count":2,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Oona%27s%20Prowler&type=card&.jpg",
         "types":[  
            "creature"
         ],
         "colors":[  
            "black"
         ],
         "cmc":2,
         "cost":"{1}{B}"
      },
      {  
         "name":"Necropotence",
         "count":2,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Necropotence&type=card&.jpg",
         "types":[  
            "enchantment"
         ],
         "colors":[  
            "black"
         ],
         "cmc":3,
         "cost":"{B}{B}{B}"
      },
      {  
         "name":"Dark Ritual",
         "count":4,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Dark%20Ritual&type=card&.jpg",
         "types":[  
            "instant"
         ],
         "colors":[  
            "black"
         ],
         "cmc":1,
         "cost":"{B}"
      },
      {  
         "name":"Swamp",
         "count":14,
         "gathererURL":"http://gatherer.wizards.com/Handlers/Image.ashx?name=Swamp&type=card&.jpg",
         "types":[  
            "land"
         ],
         "supertypes":[  
            "basic"
         ],
         "cmc":0,
         "cost":""
      }
   ]
};

function decklistInfographic() {
  var margin = 20,
      card_w = 223, card_h = 311,
      num_cols = 4;
      card_padding_x = 10;
  
  function chart(selection) {
    selection.each(function(data) {
      // number of rows is dependent on how many cards in total we
      // have and how many we can fit in a column.
      var num_rows = Math.ceil(data.cards.length / num_cols);
      var canvas_w = (margin * 2) + (card_w * num_cols) + ((num_cols - 1) * card_padding_x),
          canvas_h = (margin * 2) + (card_h * num_rows) + ((num_rows - 1) * card_padding_x);
      
      var cardLocations = [];
      for (var i = 0; i < data.cards.length; i++) {
        var c = i % num_cols, r = Math.floor(i / num_cols);
        cardLocations[i] = {
          x: (margin + card_w * c) + card_padding_x * c,
          y: (margin + card_h * r) + card_padding_x * r
        };
      }
      
      var canvas = d3.select(this).append("canvas")
          .attr("width", canvas_w)
          .attr("height", canvas_h);
      var ctx = canvas.node().getContext("2d");
      
      var imageLoadCount = 0;
      var images = new Array(data.cards.length);
      
      var drawImagesCallback = function() {
        images.forEach(function(image, i) {
          var p = cardLocations[i];
          ctx.drawImage(image, p.x, p.y);
        });
      };
      
      data.cards.forEach(function(card, i) {
        images[i] = new Image();
        images[i].src = card.gathererURL;
        images[i].onload = function() {
          if (++imageLoadCount === images.length) {
            drawImagesCallback();
          }
        }
      });
    });
  }

  return chart;
}

var deckInfographic = decklistInfographic();

d3.select("#infographic")
  .datum(deck)
  .call(deckInfographic);