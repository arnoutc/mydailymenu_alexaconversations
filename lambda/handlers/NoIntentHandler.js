const Alexa     = require('ask-sdk-core');
const states    = require('../states.js');
const menu      = require('../menu.js');
const _         = require('lodash');

 /**
 * AMAZON.NoIntentHandler. 
 * 
 * Used in response to 
 *  - being prompted to hear the daily specials
 *  - ordering a daily special
 *  
 * @param handlerInput {HandlerInput}
 * @returns {Response}
 */
const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
    },
    handle(handlerInput) {
        let speakOutput, reprompt;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        // if we just prompted them for specials, ordering daily special, or customizing special menu
        if (sessionAttributes.state == states.PROMPTED_FOR_DAILY_SPECIALS || 
                sessionAttributes.state == states.PROMPTED_TO_ORDER_DAILY_SPECIAL ||
                sessionAttributes.state == states.PROMPTED_TO_ORDER_SPECIAL){
            speakOutput = handlerInput.t('PROMPT_FOR_ACTION');
            reprompt = handlerInput.t('REMPROMPT_FOR_ACTION');
        } 
        // if we prompted them to customize and they said no
        console.log('in NoIntentHandler');
        console.log('sessionAttributes are ' + JSON.stringify(sessionAttributes));
        if (sessionAttributes.state == states.PROMPTED_TO_ADD_TO_ORDER || 
                sessionAttributes.state == states.PROMPTED_TO_CUSTOMIZE_SPECIAL_MENU){
            _.defaults(sessionAttributes, {
                orders: []
            });
            const {in_progress} = sessionAttributes;
            sessionAttributes.orders.push({ 
                date : new Date().toISOString(),
                order: in_progress
            });
            delete sessionAttributes.in_progress;
            speakOutput = handlerInput.t('PLACE_ORDER', {
                orderText: menu.generateOrderText(in_progress)
            });
            reprompt = handlerInput.t('PLACE_ORDER_REPROMPT');  
 
        } 
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};

module.exports = NoIntentHandler;