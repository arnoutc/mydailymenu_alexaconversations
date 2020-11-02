
const Alexa = require('ask-sdk-core');
let AuthTokenHandler = await import('./AuthTokenHandler.js');

const ResumeMyOrderHandler = {
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResumeMyOrderHandler';
      },
      handle(handlerInput) {
        console.log(JSON.stringify(handlerInput.requestEnvelope, 0, null));
    
        const apiAccessToken =  AuthTokenHandler.getToken(Alexa.getUserId(handlerInput.requestEnvelope));

        if (apiAccessToken) {
        console.log(`Found apiAccessToken ${apiAccessToken}, scheduling a resumption`);
        scheduleResumption(stage.value.toLowerCase(), region.value.toLowerCase(), sessionId, apiAccessToken, delay.value)
            .then((data) => console.log(`MessageID is ${data.MessageId}`))
            .catch((err) => console.error(err, err.stack));
        }

        return handlerInput.responseBuilder.getResponse();
      },
}

module.exports = ResumeMyOrderHandler;