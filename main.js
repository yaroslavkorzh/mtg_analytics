var mtg = require('mtgtop8');
console.log('test');

$(document).ready(function () {
    var pages = 10;


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
                if(archetype.count > 1){
                    renderData.push({name: archetype.name, y: archetype.count, count: archetype.count});
                }

            }

            // Build the chart
            $('#container').highcharts({
                chart: {
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
        controller.renderDeck = function () {
            var self = this;
            // prepare data
            var renderData = [];

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

