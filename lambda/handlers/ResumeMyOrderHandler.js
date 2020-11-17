const Alexa = require('ask-sdk-core');

const scheduleResumption = {
  stage : 1, 
  region : 'us-east1', 
  sessionId: '', 
  apiAccessToken: '', 
  delay: 600000
};

const ResumeMyOrderHandler = {
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResumeMyOrderHandler';
      },
      async handle(handlerInput) {
        console.log(JSON.stringify(handlerInput.requestEnvelope, 0, null));

        return handlerInput.responseBuilder.getResponse();
      },
}



module.exports = {ResumeMyOrderHandler, scheduleResumption};