const Alexa = require('ask-sdk-core');
const AuthTokenHandler = require('./AuthTokenHandler.js');
const ALEXA_AUTHORIZATION_GRANT_REQUEST = 'Alexa.Authorization.Grant'

const AuthorizationGrantHandler = {
    canHandle(handlerInput) {
      console.log(`AuthorizationGrantHandler --- canHandle -- requestEnvelope is ${JSON.stringify(handlerInput.requestEnvelope)}`);

      return Alexa.getRequestType(handlerInput.requestEnvelope) === ALEXA_AUTHORIZATION_GRANT_REQUEST;
    },
  
    handle(handlerInput) {
      console.log(`AuthorizationGrantHandler --- handle -- Received an ${ALEXA_AUTHORIZATION_GRANT_REQUEST}`);
      console.log(JSON.stringify(handlerInput.requestEnvelope, 0, null));
      AuthTokenHandler.handle(handlerInput.requestEnvelope);
  
      return handlerInput.responseBuilder.getResponse();
    },
  };

module.exports = AuthorizationGrantHandler;