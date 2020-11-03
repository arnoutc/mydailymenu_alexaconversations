const Alexa = require('ask-sdk-core');
const AuthTokenHandler = require('./AuthTokenHandler');
let scheduleResumption;

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