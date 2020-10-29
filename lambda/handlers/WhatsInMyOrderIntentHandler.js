const Alexa = require('ask-sdk-core');
const menu = require('../menu.js');

const WhatsInMyOrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhatsInMyOrderIntent'
    },
    handle(handlerInput){
        // They are asking what's in their current order
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {in_progress} = sessionAttributes;
        let speakOutput, reprompt;
        // they dont have an in progress order
        if(!in_progress){
            speakOutput = handlerInput.t('NO_CURRENT_ORDER', {
                orderText: menu.generateOrderText(in_progress)
            });
            reprompt = handlerInput.t('NO_CURRENT_ORDER_REPROMPT');
        } else {
            speakOutput = handlerInput.t('CURRENT_ORDER', {
                orderText: menu.generateOrderText(in_progress)
            });
            reprompt = handlerInput.t('CURRENT_ORDER_REPROMPT');
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}

module.exports = WhatsInMyOrderIntentHandler;