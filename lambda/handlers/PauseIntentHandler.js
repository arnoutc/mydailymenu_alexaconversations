

const PauseIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PauseIntent';
    },
    handle(handlerInput){
        let speechOutput = handlerInput.t('PAUSE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withSessionBehavior("BACKGROUNDED")
            .getResponse();
    }
}

module.exports = PauseIntentHandler;