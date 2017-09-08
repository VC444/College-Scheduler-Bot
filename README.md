# College-Scheduler-Bot
This bot helps you keep track of your exams and homeworks. I am currently working on integrating it with facebook messenger.
Built using Amazon Lex, AWS Lambda, and Dynamo DB.

## Scheduler.js
This lambda function fires when the user wants to add/delete an exam or homework to his/her scheduler.

## GetData.js
This lambda function fires when the user says  "What homeworks do I have coming up?" or "What events are upcoming?". 
It accesses dynamo db and queries the required data, which is then passed to the client app.
