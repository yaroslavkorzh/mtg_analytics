var request = require('request');
var api_url = 'https://api.magicthegathering.io/v1/';


var options = {
    url: 'https://api.magicthegathering.io/v1/sets?page=2&pageSize=10'
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(JSON.parse(body));
    }
}

function getCard(name, callback) {

    var nameURL = encodeURIComponent(name);
    $.ajax({
        url: api_url + "cards",
        type: "GET",
        contentType: "jsonp",
        data: {
            name : '"'+name+'"'
        },
        beforeSend: function (obj) {

        },
        success: function (result) {
            console.log('card ',name, ' fetched:',result);

            callback(result, name);
        },
        error: function (request, status, error) {
            console.log(request, status, error)
        },
        complete: function () {
            //console.log('finish')
        }
    });

}



module.exports = {
    getCard: getCard
};