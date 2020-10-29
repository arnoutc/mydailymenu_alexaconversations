

const StopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput){
        let speechOutput = handlerInput.t('EXIT');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
}

module.exports = StopIntentHandler;