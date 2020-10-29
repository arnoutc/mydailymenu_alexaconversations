const CancelIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput){
        let speechOutput = handlerInput.t('PROMPT_FOR_ACTION');
        let reprompt = handlerInput.t('GENERIC_REPROMPT');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}

module.exports = CancelIntentHandler;