const Alexa = require('ask-sdk-core');
const states = require('../states.js');
const menu = require('../menu.js');
const _ = require('lodash');

const AddMenuReferenceSpecialToOrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddMenuReferenceSpecialToOrderIntent'
    },
    handle(handlerInput){
        let speakOutput, reprompt;
        console.log("In AddMenuReferenceSpecialToOrderIntentHandler");

        const specialSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'special');
        const firstAuthority = _.first(_.get(specialSlot, 'resolutions.resolutionsPerAuthority'));
        const special = _.first(_.get(firstAuthority, 'values')).value.name;
        
        // the user answered yes to ordering one of the special menus
        speakOutput = handlerInput.t('PROMPT_TO_CUSTOMIZE_SPECIAL',{
            name: special
        });
        reprompt = handlerInput.t('PROMPT_TO_CUSTOMIZE_SPECIAL_REPROMPT');
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.state = states.PROMPTED_TO_CUSTOMIZE_SPECIAL_MENU;
    
        // lets save this order as in-progress
        sessionAttributes.in_progress = {special : menu.getSpecialMenuDetails(special)};
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}

module.exports = AddMenuReferenceSpecialToOrderIntentHandler;