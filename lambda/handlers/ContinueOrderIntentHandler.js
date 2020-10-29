const Alexa = require('ask-sdk-core');
const menu = require('../menu.js');

const ContinueOrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ContinueOrderIntent'
    },

    /**
     * ContinueOrderIntent handler. 
     * 
     * Triggered when the user has an existing order in their persisted attributes that hasnt been moved to orders
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        // lets get the in_progress order
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {in_progress} = sessionAttributes;
        let orderText = menu.generateOrderText(in_progress);
        let speakOutput, reprompt;
        // let's repeat their order to confirm its still what they want
        speakOutput = handlerInput.t('REPEAT_ORDER_AND_ADD_SOMETHING', { 
            orderText : orderText
        });
        reprompt = handlerInput.t('REPEAT_ORDER_AND_ADD_SOMETHING_REPROMPT');
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt) 
            .getResponse();
    }
}

module.exports = ContinueOrderIntentHandler;