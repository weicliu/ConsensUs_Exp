Template.ConfidenceSurvey.events({
    'submit form': function(e) {
        e.preventDefault();
        var confidence = $('input[name="confidence"]:checked').val();
        var willingness = $('input[name="willingness"]:checked').val()

        if (confidence === undefined || willingness == undefined) {
            alert("Please input your answers before submit.");
            return;
        }

        var order = FlowRouter.getQueryParam("order");
        Confidence.insert({userId: Meteor.userId(), confidence: confidence, willingness: willingness, order: order});

        if (order == "1") {
            FlowRouter.go('/' + FlowRouter.getParam("taskId") + '/example');
        }
        else {
            FlowRouter.go('/' + FlowRouter.getParam("taskId") + '/done');
        }
    }
});
