const Alexa = require('ask-sdk-core');
const resources = require('../resources.js');

const ResumeMyOrderHandler = {
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionResumedRequest';    
      },
      async handle(handlerInput) {
        console.log(JSON.stringify(handlerInput.requestEnvelope, 0, null));
        return handlerInput.responseBuilder
          .speak(resources.WHERE_IS)
          .getResponse();
      },
}



module.exports = ResumeMyOrderHandler;