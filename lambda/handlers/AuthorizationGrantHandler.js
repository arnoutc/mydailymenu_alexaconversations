const Alexa = require('ask-sdk-core');
const AuthTokenHandler = require('./AuthTokenHandler.js');

const AuthorizationGrantHandler = {
    canHandle(handlerInput) {
      console.log(`AuthorizationGrantHandler --- canHandle -- requestEnvelope is ${JSON.stringify(handlerInput.requestEnvelope)}`);
      console.log(`AuthorizationGrantHandler --- canHandle -- requestTypes are ${JSON.stringify(Alexa.RequestTypes)}`);

      return Alexa.getRequestType(handlerInput.requestEnvelope) === Alexa.RequestTypes.ALEXA_AUTHORIZATION_GRANT_REQUEST;
    },
  
    async handle(handlerInput) {
      console.log(`AuthorizationGrantHandler --- in handle() -- requestEnvelope is ${JSON.stringify(handlerInput.requestEnvelope)}`);
      //console.log(`Received an ${Alexa.RequestTypes.ALEXA_AUTHORIZATION_GRANT_REQUEST}`);
      console.log(JSON.stringify(handlerInput.requestEnvelope, 0, null));
      AuthTokenHandler.handle(handlerInput.requestEnvelope);
  
      return handlerInput.responseBuilder.getResponse();
    },
  };

module.exports = AuthorizationGrantHandler;