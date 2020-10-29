

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    /**
     * User asked for help
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        console.log("In HelpIntentHandler");
        let speakOutput, reprompt;
       
        speakOutput = handlerInput.t('HELP_PROMPT');
        reprompt = handlerInput.t('GENERIC_REPROMPT');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard(
                "Help", 
                "What can I help you with today?")
            .reprompt(reprompt)
            .getResponse();
    },
}

module.exports = HelpIntentHandler;
