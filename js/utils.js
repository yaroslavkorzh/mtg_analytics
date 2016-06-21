var api_url = 'https://api.magicthegathering.io/v1/'

function getCard(name) {
    var nameURL = encodeURIComponent(name);
    $.ajax({
        url: api_url + "cards?name="+ nameURL,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name : name
        }),
        beforeSend: function (obj) {

        },
        success: function (result) {

        },
        error: function (request, status, error) {

        },
        complete: function () {

        }
    });
    'cards?name=Гаррук%20Дикоречивый&language=russian'
}

module.exports = {
    getCard: getCard
};