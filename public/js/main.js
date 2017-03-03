var mtg = require('./mtgtop8fetch.js');
var utils = require('./utils.js');
var request = require('request');
var filesystem = require('file-system');
var fs = require('fs');

console.log('mtg analytics test');
//utils.getCard('Tarmogoyf');

$(document).on('click', function (e) {
    console.log(e.target);
});

//var mtgparser = require('mtg-parser');
//var deck = mtgparser(deck_string, 'mtgo');

// http://partner.tcgplayer.com/x3/phl.asmx/p?pk=WORDPRESS&p=forest&s=kaladesh


String.prototype.parseFloat = function (decimal) {
    var floatVal = parseFloat(this.replace(',', '.'));
    if (decimal) {
        return Math.floor((Math.pow(10, decimal) * floatVal)) / Math.pow(10, decimal);
    }
    return floatVal;
};

$(document).ready(function () {
    var pages = 10;
    $('.menu .item').tab();
    var $dashboardDatepicker = $("#" + 'events');
    $dashboardDatepicker.datepicker({
        todayHighlight: true,
        inline: true,
        sideBySide: true,
        multidate: true,
        orientation: "top"
    });

    $('.decktype.dropdown').selectric();


    $('.input-daterange input').each(function () {
        $(this).datepicker("clearDates");
    });
    var calendarId = '5kem7ieveeme63so8i4fdep5c4';
    var api_key = 'AIzaSyAEe8JX-_4CSzz5PxSOvV79MGEHL-hZ8Bs';
    var options = {
        url: 'https://www.wizards.com/Magic/PlaneswalkerPoints/JavaScript/GetEventSummary/7974608'//'https://www.googleapis.com/calendar/v3/calendars/'+calendarId+'/events?key='+api_key
    };


    function callback(error, response, body) {
        console.log(error, response, body);
        if (!error && response.statusCode == 200) {

        }
    }

    request(options, callback);


    /*
     var selDates = ['update'];
     var events = this.events();
     for (var i = 0; i < events.length; i++) {
     var event = events[i];
     selDates.push(new Date(event.endDate()))
     }

     if (selDates.length > 1) {
     $dashboardDatepicker.datepicker.apply($dashboardDatepicker, selDates);
     }*/

    //GET https://www.googleapis.com/calendar/v3/calendars/calendarId/events
    // calendarId = 5kem7ieveeme63so8i4fdep5c4
    // apiKey = AIzaSyD8PouwXWKJ-FNGWe50NFn6jQ54h6w10Cg

    function controllerConstructor() {
        var controller = {};

        controller.decks = {
            standart: [],
            modern: [],
            legacy: [],
            vintage: [],
            commander: []
        };

        controller.metagame = {
            standart: [],
            modern: [],
            legacy: [],
            vintage: [],
            commander: []
        };
        controller.archetypeStats = {
            standart: [],
            modern: [],
            legacy: [],
            vintage: [],
            commander: []
        };
        controller.deck_types = {
            aggro: {
                standart: ['Weenie', 'Aggro', 'Burn', 'Humans'],
                modern: [],
                legacy: [],
                vintage: [],
                commander: []
            },
            control: {
                standart: ['Control'],
                modern: [],
                legacy: [],
                vintage: [],
                commander: []
            },
            combo: {
                standart: ['Combo', 'Rites'],
                modern: [],
                legacy: [],
                vintage: [],
                commander: []
            },
            midrange: {
                standart: ['Ramp', 'Midrange'],
                modern: [],
                legacy: [],
                vintage: [],
                commander: []
            },
            hybrid: {
                standart: ['Company'],
                modern: [],
                legacy: [],
                vintage: [],
                commander: []
            }
        };
        controller.events = [];
        controller.selectedFormat = null;
        controller.formats = {
            standart: 'standart',
            modern: 'modern',
            legacy: 'legacy',
            vintage: 'vintage',
            commander: 'commander'
        };

        controller.init = function () {
            console.log('init');
            this.selectedFormat = this.formats.standart;
            var reloaded = this.reload();
            if (!reloaded) {
                this.fetchData();
            }
            else {
                this.renderMetagame();
                this.analyzeArchetypes();
                this.renderTest();
                this.renderDeck();
            }

            this.initHandlers();
        };
        controller.initHandlers = function () {
            var self = this;
            $('#formatSelect').on('change', function (e) {
                self.changeFormat($(this).val());
                self.renderMetagame();
            });


            $("#project").autocomplete({
                    minLength: 0,
                    source: self.metagame[self.selectedFormat],
                    focus: function (event, ui) {
                        $("#project").val(ui.item.name);
                        return false;
                    },
                    select: function (event, ui) {
                        //$( "#project" ).val( ui.item.name );
                        //$( "#project-id" ).val( ui.item.count );
                        //$( "#project-description" ).html( ui.item.name );
                        //$( "#project-icon" ).attr( "src", "images/" + ui.item.name );

                        self.renderDeck(ui.item);

                        return false;
                    }
                })
                .autocomplete("instance")._renderItem = function (ul, item) {
                return $("<li>")
                    .append("<a>" + item.name + "<br>" + item.count + "</a>")
                    .appendTo(ul);
            };
        };
        controller.save = function () {
            localStorage.setItem('decks', JSON.stringify(this.decks));
            localStorage.setItem('metagame', JSON.stringify(this.metagame));
            localStorage.setItem('events', JSON.stringify(this.events));
        };
        controller.reload = function () {
            var self = this;
            var result = false;
            var rest_decks = localStorage.getItem('decks');
            var rest_metagame = localStorage.getItem('metagame');
            var rest_events = localStorage.getItem('events');
            if (rest_decks) {
                console.log('restored decks');
                this.decks = JSON.parse(rest_decks);
            }
            if (rest_metagame) {
                console.log('restored metagame');
                result = true;
                this.metagame = JSON.parse(rest_metagame);
            }
            if (rest_events) {
                console.log('restored events');
                this.events = JSON.parse(rest_events);
            }

            var dd_data = this.metagame[this.selectedFormat];

            var archetypeSelect = $('#ms-complex-templating').magicSuggest({
                placeholder: 'Select...',
                allowFreeEntries: false,
                data: dd_data,
                selectionPosition: 'bottom',
                selectionStacked: true,
                maxSelection: 1,
                renderer: function (data) {
                    return '<div style="padding: 5px; overflow:hidden;">' +
                        '<div style="float: left;"><i class="mtg mana-6"></i><i class="mtg blue"></i><i class="mtg hybrid-ur"></i></div>' +
                        '<div style="float: left; margin-left: 5px">' +
                        '<div style="font-weight: bold; color: #333; font-size: 10px; line-height: 11px">' + data.name + '</div>' +
                        '<div style="color: #999; font-size: 9px">' + data.count + '</div>' +
                        '</div>' +
                        '</div><div style="clear:both;"></div>'; // make sure we have closed our dom stuff
                },
                selectionRenderer: function (data) {

                    return '<div style="padding: 5px; overflow:hidden;">' +
                        '<div class="mana-colors" style="float: left;"></div>' +
                        '<div style="float: left; margin-left: 5px">' +
                        '<div style="font-weight: bold; color: #333; font-size: 10px; line-height: 11px">' + data.name + '</div>' +
                        '<div style="color: #999; font-size: 9px"> Submitted decks: ' + '<span style="font-weight: bold; color: #333; font-size: 10px; line-height: 11px">'+data.count +'</span>'+ '</div>' +
                        '</div>' +
                        '</div><div style="clear:both;"></div>'; // make sure we have closed our dom stuff
                }
            });

            $(archetypeSelect).on('selectionchange', function (e, m, data) {
                self.renderDeck(data[0]);
            });
            //self.renderDeck(ui.item);

            return result;
        };
        controller.renderStats = function () {
            this.renderMetagame();
            this.renderDeck();
            //this.renderTest()
        };
        controller.analyzeArchetypes = function () {
            //deck_types
            var self = this;
            var data = [];
            var drilldowns = [];
            /*
             {
             name: 'Microsoft Internet Explorer',
             y: 56.33,
             drilldown: 'Microsoft Internet Explorer'
             }
             * */

            $.each(this.deck_types, function (index, value) {
                var searchPattern = '';
                var patterns = [];

                patterns = self.deck_types[index][self.selectedFormat];
                for (var i = 0; i < patterns.length; i++) {
                    searchPattern = searchPattern + patterns[i];
                    if (i < patterns.length - 1) {
                        searchPattern += '|'
                    }
                }
                console.log(searchPattern);
                var query = new RegExp("(\\b" + searchPattern + "\\b)", "gim");
                var drilldown = [];
                var totalCount = 0;

                for (var k = 0; k < self.metagame[self.selectedFormat].length; k++) {
                    var archetype = self.metagame[self.selectedFormat][k];
                    if (archetype.count > 0 && archetype.name.match(query)) {
                        /*{
                         name: 'Microsoft Internet Explorer',
                         id: 'Microsoft Internet Explorer',
                         data: [
                         ['v11.0', 24.13],
                         ['v8.0', 17.2],
                         ['v9.0', 8.11],
                         ['v10.0', 5.33],
                         ['v6.0', 1.06],
                         ['v7.0', 0.5]
                         ]
                         } */
                        drilldown.push([archetype.name, archetype.count]);
                        totalCount += archetype.count;
                    }

                }
                data.push({
                    name: index,
                    y: totalCount,
                    drilldown: index
                });
                drilldowns.push({
                    name: index,
                    id: index,
                    data: drilldown
                });
                console.log(index, ' data total:', totalCount, ' data:', drilldown);
            });

            // Create the chart
            $('#test').highcharts({
                chart: {
                    height: 700,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: self.selectedFormat + ' archetypes drilldown'
                },
                subtitle: {
                    text: 'Click the slices to view details'
                },
                plotOptions: {
                    pie: {
                        slicedOffset: 0,
                        size: '100%',
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:16px">{series.name}</span><br>',
                    pointFormat: '<span style="font-size:16px;color:{point.color}">{point.name}</span>: <b>{point.percentage:.1f}%</b> of total<br/></br>Total decks: <b>{point.y}</b>'
                },
                series: [{
                    name: 'Archetypes',
                    colorByPoint: true,
                    data: data
                }],
                drilldown: {
                    series: drilldowns
                }
            });
            //var archetypes = $('#test').highcharts();
            //$('#test').resizable({
            //    // On resize, set the chart size to that of the
            //    // resizer minus padding. If your chart has a lot of data or other
            //    // content, the redrawing might be slow. In that case, we recommend
            //    // that you use the 'stop' event instead of 'resize'.
            //    resize: function () {
            //        archetypes.setSize(
            //            this.offsetWidth - 20,
            //            this.offsetHeight - 40,
            //            false
            //        );
            //    }
            //});

        };
        controller.renderArchetypes = function (format) {
            var self = this;
            // Create the chart

        };
        controller.renderMetagame = function (format) {
            var self = this;
            if (format) {
                this.changeFormat(format);
            }
            // prepare data
            var renderData = [];
            for (var k = 0; k < this.metagame[this.selectedFormat].length; k++) {
                var archetype = this.metagame[this.selectedFormat][k];
                if (archetype.count > 0) {
                    renderData.push({name: archetype.name, y: archetype.count, count: archetype.count});
                }

            }
            // Build the chart
            $('#container').highcharts({
                chart: {
                    height: 750,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: self.selectedFormat + ' metagame'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b></br> Total decks: <b>{point.count}</b>'
                },
                plotOptions: {
                    pie: {
                        size: '100%',
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Metagame share',
                    colorByPoint: true,
                    data: renderData
                }]
            });
        };
        controller.renderTest = function (format) {

            $('#test3').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Stacked column chart'
                },
                xAxis: {
                    categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total fruit consumption'
                    }
                },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                    shared: true
                },
                plotOptions: {
                    size: '100%',
                    column: {
                        stacking: 'percent'
                    }
                },
                series: [{
                    name: 'John',
                    data: [5, 3, 4, 7, 2]
                }, {
                    name: 'Jane',
                    data: [2, 2, 3, 2, 1]
                }, {
                    name: 'Joe',
                    data: [3, 4, 4, 2, 5]
                }]
            });

            $('#test4').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'World\'s largest cities per 2014'
                },
                subtitle: {
                    text: 'Source: <a href="http://en.wikipedia.org/wiki/List_of_cities_proper_by_population">Wikipedia</a>'
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Population (millions)'
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: 'Population in 2008: <b>{point.y:.1f} millions</b>'
                },
                series: [{
                    name: 'Population',
                    data: [
                        ['Shanghai', 23.7],
                        ['Lagos', 16.1],
                        ['Istanbul', 14.2],
                        ['Karachi', 14.0],
                        ['Mumbai', 12.5],
                        ['Moscow', 12.1],
                        ['São Paulo', 11.8],
                        ['Beijing', 11.7],
                        ['Guangzhou', 11.1],
                        ['Delhi', 11.1],
                        ['Shenzhen', 10.5],
                        ['Seoul', 10.4],
                        ['Jakarta', 10.0],
                        ['Kinshasa', 9.3],
                        ['Tianjin', 9.3],
                        ['Tokyo', 9.0],
                        ['Cairo', 8.9],
                        ['Dhaka', 8.9],
                        ['Mexico City', 8.9],
                        ['Lima', 8.9]
                    ],
                    dataLabels: {
                        enabled: true,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}', // one decimal
                        y: 10, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                }]
            });

            // Create the chart
            $('#test5').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Browser market shares. January, 2015 to May, 2015'
                },
                subtitle: {
                    text: 'Click the columns to view versions. Source: <a href="http://netmarketshare.com">netmarketshare.com</a>.'
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }

                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    size: '100%',
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.1f}%'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },

                series: [{
                    name: 'Brands',
                    colorByPoint: true,
                    data: [{
                        name: 'Microsoft Internet Explorer',
                        y: 56.33,
                        drilldown: 'Microsoft Internet Explorer'
                    }, {
                        name: 'Chrome',
                        y: 24.03,
                        drilldown: 'Chrome'
                    }, {
                        name: 'Firefox',
                        y: 10.38,
                        drilldown: 'Firefox'
                    }, {
                        name: 'Safari',
                        y: 4.77,
                        drilldown: 'Safari'
                    }, {
                        name: 'Opera',
                        y: 0.91,
                        drilldown: 'Opera'
                    }, {
                        name: 'Proprietary or Undetectable',
                        y: 0.2,
                        drilldown: null
                    }]
                }],
                drilldown: {
                    series: [{
                        name: 'Microsoft Internet Explorer',
                        id: 'Microsoft Internet Explorer',
                        data: [
                            [
                                'v11.0',
                                24.13
                            ],
                            [
                                'v8.0',
                                17.2
                            ],
                            [
                                'v9.0',
                                8.11
                            ],
                            [
                                'v10.0',
                                5.33
                            ],
                            [
                                'v6.0',
                                1.06
                            ],
                            [
                                'v7.0',
                                0.5
                            ]
                        ]
                    }, {
                        name: 'Chrome',
                        id: 'Chrome',
                        data: [
                            [
                                'v40.0',
                                5
                            ],
                            [
                                'v41.0',
                                4.32
                            ],
                            [
                                'v42.0',
                                3.68
                            ],
                            [
                                'v39.0',
                                2.96
                            ],
                            [
                                'v36.0',
                                2.53
                            ],
                            [
                                'v43.0',
                                1.45
                            ],
                            [
                                'v31.0',
                                1.24
                            ],
                            [
                                'v35.0',
                                0.85
                            ],
                            [
                                'v38.0',
                                0.6
                            ],
                            [
                                'v32.0',
                                0.55
                            ],
                            [
                                'v37.0',
                                0.38
                            ],
                            [
                                'v33.0',
                                0.19
                            ],
                            [
                                'v34.0',
                                0.14
                            ],
                            [
                                'v30.0',
                                0.14
                            ]
                        ]
                    }, {
                        name: 'Firefox',
                        id: 'Firefox',
                        data: [
                            [
                                'v35',
                                2.76
                            ],
                            [
                                'v36',
                                2.32
                            ],
                            [
                                'v37',
                                2.31
                            ],
                            [
                                'v34',
                                1.27
                            ],
                            [
                                'v38',
                                1.02
                            ],
                            [
                                'v31',
                                0.33
                            ],
                            [
                                'v33',
                                0.22
                            ],
                            [
                                'v32',
                                0.15
                            ]
                        ]
                    }, {
                        name: 'Safari',
                        id: 'Safari',
                        data: [
                            [
                                'v8.0',
                                2.56
                            ],
                            [
                                'v7.1',
                                0.77
                            ],
                            [
                                'v5.1',
                                0.42
                            ],
                            [
                                'v5.0',
                                0.3
                            ],
                            [
                                'v6.1',
                                0.29
                            ],
                            [
                                'v7.0',
                                0.26
                            ],
                            [
                                'v6.2',
                                0.17
                            ]
                        ]
                    }, {
                        name: 'Opera',
                        id: 'Opera',
                        data: [
                            [
                                'v12.x',
                                0.34
                            ],
                            [
                                'v28',
                                0.24
                            ],
                            [
                                'v27',
                                0.17
                            ],
                            [
                                'v29',
                                0.16
                            ]
                        ]
                    }]
                }
            });
        };
        controller.renderDeck = function (decktype) {
            var self = this;
            // prepare data
            var renderData = [];
            var selectedDecks = [];
            var selectedType;
            if (!decktype) {
                var randMeta = self.metagame[self.selectedFormat][Math.floor(Math.random() * self.metagame[self.selectedFormat].length)];
                selectedType = randMeta;
            }
            else {
                selectedType = decktype
            }

            for (var k = 0; k < self.decks[self.selectedFormat].length; k++) {
                var deck = self.decks[self.selectedFormat][k];
                if (deck.title == selectedType.name) {
                    selectedDecks.push(deck)
                }
            }

            var cardsPlayed = [];
            var cardsData = [];

            for (var i = 0; i < selectedDecks.length; i++) {
                var data = selectedDecks[i];
                for (var ii = 0; ii < data.cards.length; ii++) {
                    var card = data.cards[ii];
                    if (cardsPlayed.indexOf(card.name) == -1) {
                        cardsPlayed.push(card.name);
                        utils.getCard(card.name, function(result, cardName){
                            console.log('got response callback', result);
                            cardsData.push({name : cardName, data: result});
                            if(cardsData.length === cardsPlayed.length){
                                console.log('------------');
                                console.log('all data fetched');

                                dataFetchedCallback.call(self);
                            }
                        });
                    }
                    else {

                    }
                }
            }


            function dataFetchedCallback () {
                var cardCounts = [];
                var cardTableData = [];
                var cardTableColumns = [{title: 'Card'}];
                var cardsPlayed = [];
                for (var i = 0; i < selectedDecks.length; i++) {
                    var data = selectedDecks[i];
                    for (var ii = 0; ii < data.cards.length; ii++) {
                        var card = data.cards[ii];
                        if (cardsPlayed.indexOf(card.name) == -1) {
                            cardsPlayed.push(card.name);
                        }
                        else {

                        }
                    }
                }

                var colors = [];
                var target = $('.mana-colors');
                target.html('');


                for (var k = 0; k < cardsData.length; k++) {
                        var c_data = cardsData[k].data;
                        if(c_data.cards){
                            for (var kk = 0; kk < c_data.cards.length; kk++) {
                                var card = c_data.cards[kk];
                                if(card.colors){
                                    for (var kkk = 0; kkk < card.colors.length; kkk++) {
                                        var color = card.colors[kkk];
                                        if(colors.indexOf(color) == -1){
                                            colors.push(color);

                                            $('<i class="mtg '+ color.toLowerCase() +'"></i>').appendTo(target);
                                        }
                                    }
                                }

                            }
                        }
                }
                console.log('colors', colors);
                //<i class="mtg mana-6"></i>

                for (var m = 0; m < selectedDecks.length; m++) {
                    console.log('--------------------------');
                    var deckData = selectedDecks[m];
                    var seriesElement = {
                        name: deckData.player + '| place: ' + deckData.result,
                        deckFinish: deckData.result,
                        player: deckData.player,
                        data: []
                    };
                    cardTableColumns.push({title: deckData.player + '| place: ' + deckData.result});
                    for (var mm = 0; mm < cardsPlayed.length; mm++) {
                        var cardName = cardsPlayed[mm];
                        //var cardName = cardsData[mm].name;
                        //console.log(cardsData[mm]);
                        var found = false;
                        if (!cardTableData[mm]) {
                            cardTableData[mm] = [cardName];
                        }
                        for (var mmm = 0; mmm < deckData.cards.length; mmm++) {
                            var cardCount = deckData.cards[mmm];
                            if (cardName == cardCount.name) {
                                console.log('found', cardCount);
                                found = true;
                                seriesElement.data[mm] = cardCount.count;
                                cardTableData[mm][m + 1] = cardCount.count;
                            }
                        }

                        if (!found) {
                            console.log('not found', cardCount);
                            seriesElement.data[mm] = 0;
                            cardTableData[mm][m + 1] = 0;
                        }
                    }
                    cardCounts.push(seriesElement);
                }


                //var table = $('#example').DataTable({
                //    data: cardTableData,
                //    columns: cardTableColumns,
                //    fixedHeader: true,
                //    "bPaginate": false,
                //    "bFilter": false,
                //    "sScrollY": "600",
                //    "sScrollX": "100%",
                //    "sScrollXInner": "400%",
                //    "columnDefs": [
                //        {"visible": true, "targets": 0}
                //    ],
                //    "order": [[0, 'asc']],
                //    "displayLength": 25,
                //    "drawCallback": function (settings) {
                //
                //    },
                //    "footerCallback": function (row, data, start, end, display) {
                //        var api = this.api(), data;
                //        //
                //        //// Remove the formatting to get integer data for summation
                //        //var intVal = function (i) {
                //        //    return typeof i === 'string' ?
                //        //    i.replace(/[\$,]/g, '') * 1 :
                //        //        typeof i === 'number' ?
                //        //            i : 0;
                //        //};
                //        //
                //        //// Total over all pages
                //        //total = api
                //        //    .column(4)
                //        //    .data()
                //        //    .reduce(function (a, b) {
                //        //        return intVal(a) + intVal(b);
                //        //    }, 0);
                //        //
                //        //// Total over this page
                //        //pageTotal = api
                //        //    .column(4, {page: 'current'})
                //        //    .data()
                //        //    .reduce(function (a, b) {
                //        //        return intVal(a) + intVal(b);
                //        //    }, 0);
                //        //
                //        //// Update footer
                //        //$(api.column(4).footer()).html(
                //        //    '$' + pageTotal + ' ( $' + total + ' total)'
                //        //);
                //    }
                //});
                //setTimeout(function () {
                //    //table.fnAdjustColumnSizing();
                //}, 10 );

                $('#example tbody').on('mouseenter', 'td', function () {
                    var colIdx = table.cell(this).index().column;

                    $(table.cells().nodes()).removeClass('highlight');

                    //$(table.column(colIdx).nodes()).addClass('highlight');
                    $(this).addClass('highlight');
                });

                var averageArr = [];
                for (var n = 0; n < cardsPlayed.length; n++) {
                    cardName = cardsPlayed[n];
                    var totalCount = 0;

                    for (var nn = 0; nn < selectedDecks.length; nn++) {
                        deckData = selectedDecks[nn];
                        var a_found = false;

                        for (var nnn = 0; nnn < deckData.cards.length; nnn++) {
                            cardCount = deckData.cards[nnn];
                            if (cardName == cardCount.name) {
                                //console.log('found', cardCount.name);
                                a_found = true;
                                totalCount += cardCount.count;
                            }
                        }
                        if (!a_found) {
                            //console.log('not found', cardCount.name)
                        }

                    }
                    averageArr.push((totalCount / selectedDecks.length).toString().parseFloat(2));
                }

                var average = {
                    name: 'Average',
                    type: 'spline',
                    data: averageArr,
                    tooltip: {
                        valueSuffix: ' cards'
                    }
                };

                if (cardCounts.length > 1) {
                    cardCounts.push(average);
                }

                console.log('Archetype: ', selectedType);
                console.log('cards played:', cardsPlayed);
                console.log('Selected decks:', selectedDecks);
                console.log('cardCounts: ', cardCounts);

                $('#test2').highcharts({
                    chart: {
                        height: 700,
                        type: 'column'
                    },
                    title: {
                        text: selectedType.name + ' deck compare'
                    },
                    subtitle: {
                        text: 'decklist analytics'
                    },
                    xAxis: {
                        categories: cardsPlayed,
                        crosshair: true
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Card counts'
                        }
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:18px">{point.key}</span><br><div style="font-size:18px"><img src="/img/104.jpg"></div><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name} :</td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                        footerFormat: '</table>',
                        formatter: function () {
                            var s = '<span style="font-size:18px">' + this.x + '</span><br>';
                            var index = this.points[0].point.x;

                            for (n = 0; n < cardsData.length; n++) {
                                var card = cardsData[n];
                                if (card.name == this.x) {
                                    var data = card;
                                }
                            }

                            var imageUrl = '';
                            if (data) {
                                for (n = 0; n < data.data.cards.length; n++) {
                                    if (data.data.cards[n].imageUrl && this.x.toLowerCase() == data.data.cards[n].name.toLowerCase()) {
                                        imageUrl = data.data.cards[n].imageUrl;
                                    }
                                }
                            }

                            s += '<span style=""><img src="' + imageUrl + '" style="' + '"></span>';
                            s += '<table style="margin-top: 3px;">';
                            $.each(this.points, function () {
                                s += '<tr><td style="color:{series.color};padding:0">' + this.series.name + '</td>' +
                                    '<td style="padding:0"> | count: <b>' + this.y + '</b></td></tr>' + '';
                            });

                            s += '</table>';
                            var cont = '<div style="width:250px; height:450px;">' + s + '</div>';

                            return cont;
                        },
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        size: '100%',
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    series: cardCounts
                });
            }

        };


        /* Utility functions */
        controller.changeFormat = function (newFormat) {
            var self = this;
            $.each(this.formats, function (index, value) {
                if (value == newFormat) {
                    console.log('changed format to', self.formats[index]);
                    self.selectedFormat = self.formats[index];
                }
            });
        };
        controller.fetchData = function (format) {
            var self = this;
            if (format) {
                this.changeFormat(format);
            }
            // Get a list of events

            for (var l = 1; l <= pages; l++) {
                mtg.fetchArchetypeEvents(self.selectedFormat.toLowerCase(), l, function (err, events) {
                    if (err) return console.error(err);

                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        self.events.push(event);
                        if (event.stars > -1 || event.bigstars > -1) {
                            console.log(event);
                            // Get player results and decks about a specific event
                            mtg.event(event.id, function (err, event) {
                                if (err) return console.error(err);

                                console.log(event);
                                for (var i = 0; i < event.decks.length; i++) {
                                    self.addDeck(event.decks[i])
                                }
                            });
                        }

                    }


                });
            }
        };
        controller.addDeck = function (deckData) {
            var result = null;
            var search = this.getDeckById(deckData.id)
            if (!search) {
                this.decks[this.selectedFormat].push(deckData);

            }
            this.addMetagame(deckData.title);

            return result;
        };
        controller.addMetagame = function (metaData) {
            var result = null;
            var search = null;
            for (var k = 0; k < this.metagame[this.selectedFormat].length; k++) {
                var archetype = this.metagame[this.selectedFormat][k];
                if (archetype.name == metaData) {
                    archetype.count += 1;
                    search = true;
                    result = archetype
                }
            }
            if (!search) {
                this.metagame[this.selectedFormat].push({name: metaData, count: 1});
                result = true;
            }

            return result;
        };
        controller.getDeckById = function (id) {
            var result = null;
            var deck;
            for (var k = 0; k < this.decks[this.selectedFormat].length; k++) {
                deck = this.decks[this.selectedFormat][k];
                if (deck.id == id) {
                    result = deck;
                }
            }

            return result;
        };
        controller.getDeckId = function (id) {
            var result = null;
            var deck;
            for (var k = 0; k < this.decks[this.selectedFormat].length; k++) {
                deck = this.decks[this.selectedFormat][k];
                if (deck.id == id) {
                    result = k;
                }
            }

            return result;
        };
        /* Workflow functions */

        return controller;
    }

    document.analytics = controllerConstructor();
    document.analytics.init();

});

