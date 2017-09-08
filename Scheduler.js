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
    const examOrHomework = slots.ExamOrHomework;
    const date = slots.Date;
    const time = slots.Time;
    
    var params = {
        Item: {
            "CourseID": courseId,
            "Type": examOrHomework,
            "Date": date,
            "Time": time
        },
        
        TableName: 'collegeScheduleDB'
    }
    
    docClient.put(params, function(err, data){
        if (err){
            callback(err, null);
        }else{
            callback(null, data);
        }
    });
    
    callback(close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': `Okay, I have scheduled an ${examOrHomework} for ${courseId} on ${date} at ${time}`}));
    
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
