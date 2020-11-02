const Alexa = require('ask-sdk-core');
const AuthTokenHandler = require('./AuthTokenHandler.js');

const AuthorizationGrantHandler = {
    canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === Alexa.RequestTypes.ALEXA_AUTHORIZATION_GRANT_REQUEST;
    },
  
    handle(handlerInput) {
      console.log(`Received an ${Alexa.RequestTypes.ALEXA_AUTHORIZATION_GRANT_REQUEST}`);
      console.log(JSON.stringify(handlerInput.requestEnvelope, 0, null));
      AuthTokenHandler.handle(handlerInput.requestEnvelope);
  
      return handlerInput.responseBuilder.getResponse();
    },
  };

module.exports = AuthorizationGrantHandler;