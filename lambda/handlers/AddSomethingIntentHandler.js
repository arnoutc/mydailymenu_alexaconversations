const Alexa = require('ask-sdk-core');
const menu = require('../menu.js');
const _ = require('lodash');

const AddSomethingIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AddSomethingIntent';
    },
    /**
     * The user asked to add something to their order. Depending on what they asked to add
     * lets give them a list of options.
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        console.log("In AddSomethingIntentHandler");
        let speakOutput, reprompt;
        const itemSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'item');
        const firstAuthority = _.first(_.get(itemSlot, 'resolutions.resolutionsPerAuthority'));
        const item = _.first(_.get(firstAuthority, 'values')).value.name;
        if (item === 'menu'){
            speakOutput = handlerInput.t('MENU_ORDER_OPTIONS');
            reprompt = handlerInput.t('MENU_ORDER_OPTIONS_REPROMPT');
        } else if (item === 'drink'){
            speakOutput = handlerInput.t('DRINK_ORDER_OPTIONS',{
                drinks : menu.makeSpeakableList(menu.getDrinks())
            });
            reprompt = handlerInput.t('DRINK_ORDER_OPTIONS_REPROMPT');
        } else {
            speakOutput = handlerInput.t('UNRECOGONIZED_ITEM');
            reprompt = handlerInput.t('UNRECOGONIZED_ITEM_REPROMPT');
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}

module.exports = AddSomethingIntentHandler;