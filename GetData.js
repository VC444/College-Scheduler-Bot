'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000"
});
     
// Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

function dispatch(intentRequest, callback) {
    console.log('request received for userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.intentName}');
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const courseId = slots.CourseID;
    
    var params = {
        TableName: 'collegeScheduleDB',
        Limit: 10
    };
    
    docClient.scan(params, function(err, data){
        if (err){
            callback(err, null);
        }else{
            var courseId = [], type = [], date = [], time = [];
            var lexMessage = [];
            var finalMessage = "";
            
            var json = data.Items;
            
            
            
            for (var i = 0; i < json.length; i++) {
                var obj = json[i];
                var convertDate = new Date(obj.Date);
                convertDate.toString();
                
                var convertTime = tConvert(obj.Time);
                
                lexMessage[i] = obj.CourseID + " " + obj.Type + " on " + obj.Date + " at " + convertTime;
                finalMessage += lexMessage[i] + ". ";
            }
                /*
                courseId[count] = schedule.CourseID;
                type[count] = schedule.Type;
                date[count] = schedule.Date;
                time[count] = schedule.Time;
                count++;
                */
            
            callback(close(sessionAttributes, 'Fulfilled',
            {'contentType': 'PlainText', 'content': finalMessage
            }));
        }
    });
}

function tConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}

// --------------- Main handler -----------------------
 
// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};
