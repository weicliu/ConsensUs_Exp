function shuffle(array) {
    // credits to http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
    }

    return array;
}

function startIndiTimer(duration, display) {
    var timer = duration, minutes, seconds;
    var countdown = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = 0;
            $('#time').css("color", "red");
            clearInterval(countdown);
        }
    }, 1000);
}

Template.individualPage.helpers({
    authInProcess: function() {
        return Meteor.loggingIn();
    },
    loggedIn: function() {
        return !!Meteor.user(); // **
    },
    ord1: function() {
        var ord = FlowRouter.getQueryParam("order");
        return ord == "1";
    },
    info_url: function() {
        var urls = new Array(6);
        urls[0] = "https://docs.google.com/spreadsheets/d/1Is_kRroJXgTj9ZseQ9sfw44Crh7FfSTaqgj7Sbd7b1k/edit?usp=sharing";
        urls[1] = "https://docs.google.com/spreadsheets/d/1ijPtrQiyFO9L6TxoL2tL-UpoX0EPOzKjoisKm6NoO6Q/edit?usp=sharing";
        urls[2] = "https://docs.google.com/spreadsheets/d/1Pj1W9RGk0BgqyxTtVn-qjMu0GXvE9mTJT6dAS-r3pIs/edit?usp=sharing";
        urls[3] = "https://docs.google.com/spreadsheets/d/1X8dYwE2eX-FU0CMH5AgPAoYXgDOuHyyrkAYBsqFBX44/edit?usp=sharing";
        urls[4] = "https://docs.google.com/spreadsheets/d/1dsyL5JzRIcoC02BXGgOHrjSya65zBpXwCCDaWNARCtI/edit?usp=sharing";
        urls[5] = "https://docs.google.com/spreadsheets/d/1_6EZsLCbNCX5DOU_WyEBwq3OTOGVQnUeaf-S9pxUQkQ/edit?usp=sharing";
        shuffle(urls);
        Meteor.users.update(
            {_id: Meteor.userId()},
            {$set:
                {
                    "profile.url": urls[0],
                }
            }
        );
        return urls[0];
    }
});


Template.individualPage.events({
    'click #btn-next': (event) => {

        // check scores
        if (!devMode) {
            for (var i = 1; i < 4; i++) {
                if (scores[0][i] == -1) {
                    alert("Please give score to each candidate regarding each criterion before submit.");
                    return;
                }
            }
        }

        $('#myModal').modal();
        var overall = scores[0].slice(1,4);
        var names = ["Sam", "Adam", "Jim"];
        var pair = {};
        for (var i = 0; i < 3; i++) {
            pair[names[i]] = overall[i];
        }
        var sortable = [];
        for (var name in pair)
              sortable.push([name, pair[name]]);

        sortable.sort(
            function(a, b) {
                return b[1] - a[1];
            }
        )

        overall.sort();
        var names_rank = new Array(3);
        for (var i = 0; i < 3; i++) {
            names_rank[i] = names[scores[0].indexOf(overall[2-i])];
        }

        $('#1_name').html(sortable[0][0]);
        $('#2_name').html(sortable[1][0]);
        $('#3_name').html(sortable[2][0]);
        $('#1_score').html(sortable[0][1]);
        $('#2_score').html(sortable[1][1]);
        $('#3_score').html(sortable[2][1]);
    },
    'click #btn-confirm': (event) => {
        // save scores
        const FLAG = 1;
        var order = FlowRouter.getQueryParam("order");

        Scores.insert({userId:  Meteor.userId(), score: scores, order: order });

        // **************
        // random select voters

        var voters = [];
        const VOTER_NUM = 6;
        for (var i = 1; i < 3; i++) {
            var potentialVoters = Voters.find({flag:i}).fetch();
            shuffle(potentialVoters);
            voters = voters.concat(potentialVoters.slice(0, VOTER_NUM/2));
        }

        shuffle(voters);
        for (var i = 0; i < voters.length; i++) {
            voters[i] = voters[i].name;
        }

        Meteor.users.update(
            {_id: Meteor.userId()},
            {$set:
                {
                    "profile.voters": voters,
                }
            }
        );


        // **************


        if (order == "1") {
            timerEnd(1);
        }
        $("body").removeClass("modal-open");
        $('body, html').animate({ scrollTop: 0 }, 800);
        FlowRouter.go('/' + FlowRouter.getParam("taskId") + '/confidence?order='+order);
    }
});


Template.individualPage.onRendered(function() {
    var order = FlowRouter.getQueryParam("order");

    if (order == "1") {
        Session.set('hideEndTour', hideEndTour);
        individualTour.init();
        individualTour.start(true);
    }

    $('#step').html("1/3");

});
