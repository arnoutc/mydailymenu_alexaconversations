
// *****************************************************************************
// This is the default intent handler to handle all intent requests.
const OtherIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name !== 'GetSpecialtyMenuListIntent' && request.intent.name !== 'BuildMyMenuIntent';
    },

    /**
     * If user says something which is not handled by the specific intent handlers, then the request should be handled by this default
     * Intent handler. This prompts the user to select one of our defined Intents. For now, GetSpecialtyMenuListIntent and BuildMyMenuIntent
     * 
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */

    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        console.log('In catch all intent handler. Intent invoked: ' + intentName);
        const speechOutput = handlerInput.t('GENERIC_REPROMPT');

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
}

module.exports = OtherIntentHandler;