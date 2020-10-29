

/**
 * For Skill Resumption, when user actively pauses the interaction
 */
const WhereIsMyOrderIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'WhereIsMyOrderIntent';
    },
    handle(handlerInput){
        let speechOutput = handlerInput.t('PAUSE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
}

module.exports = WhereIsMyOrderIntentHandler;