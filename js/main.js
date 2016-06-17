var mtg = require('mtgtop8');
console.log('mtg analytics test');

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
            })

        };
        controller.save = function () {
            localStorage.setItem('decks', JSON.stringify(this.decks));
            localStorage.setItem('metagame', JSON.stringify(this.metagame));
            localStorage.setItem('events', JSON.stringify(this.events));
        };
        controller.reload = function () {
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
        controller.renderDeck = function () {
            var self = this;
            // prepare data
            var renderData = [];
            var selectedDecks = [];
            var randMeta = self.metagame[self.selectedFormat][Math.floor(Math.random() * self.metagame[self.selectedFormat].length)];
            for (var k = 0; k < self.decks[self.selectedFormat].length; k++) {
                var deck = self.decks[self.selectedFormat][k];
                if (deck.title == randMeta.name) {
                    selectedDecks.push(deck)
                }
            }

            var cardsPlayed = [];
            var cardCounts = [];
            for (var i = 0; i < selectedDecks.length; i++) {
                var data = selectedDecks[i];
                for (var ii = 0; ii < data.cards.length; ii++) {
                    var card = data.cards[ii]
                    if(cardsPlayed.indexOf(card.name) == -1){
                        cardsPlayed.push(card.name)
                    }
                    else {

                    }
                }
            }

            for (var m = 0; m < selectedDecks.length; m++) {
                var deckData = selectedDecks[m];
                var seriesElement = {
                    name: deckData.player+'| result: '+deckData.result,
                    deckFinish: deckData.result,
                    player: deckData.player,
                    data: []
                };
                for (var n = 0; n < cardsPlayed.length; n++) {
                    var cardName = cardsPlayed[n];
                    var found = false;
                    for (var mm = 0; mm < deckData.cards.length; mm++) {
                        var cardCount = deckData.cards[mm];
                        if(cardName == cardCount.name){
                            console.log('found', cardCount.name);
                            found = true;
                            seriesElement.data[n] = cardCount.count;
                        }
                    }
                    if(!found){
                        console.log('not found', cardCount.name)
                        seriesElement.data[n] = 0;
                    }
                }
                cardCounts.push(seriesElement);
            }
            var averageArr = [];


                for ( n = 0; n < cardsPlayed.length; n++) {
                    cardName = cardsPlayed[n];
                    var totalCount = 0;

                    for (m = 0; m < selectedDecks.length; m++) {
                        deckData = selectedDecks[m];
                        found = false;
                        for (mm = 0; mm < deckData.cards.length; mm++) {
                            cardCount = deckData.cards[mm];
                            if (cardName == cardCount.name) {
                                console.log('found', cardCount.name);
                                found = true;
                                totalCount += cardCount.count;
                            }
                        }
                        if (!found) {
                            console.log('not found', cardCount.name)
                        }

                    }
                    averageArr.push(totalCount/selectedDecks.length)
                }



            var average =  {
                name: 'Average',
                type: 'spline',
                data: averageArr,
                tooltip: {
                    valueSuffix: ' cards'
                }
            };
            cardCounts.push(average);
            
            console.log('Archetype: ', randMeta);
            console.log('cards played:',cardsPlayed);
            console.log('Selected decks:', selectedDecks);
            console.log('seriesElement: ', seriesElement);

            $('#test2').highcharts({
                chart: {
                    height: 750,
                    type: 'column'
                },
                title: {
                    text: 'deck compare'
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
                    headerFormat: '<span style="font-size:18px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name} :</td>' +
                    '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
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

