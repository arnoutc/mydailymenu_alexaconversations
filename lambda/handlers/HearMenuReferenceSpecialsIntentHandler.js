const states = require('../states.js');
const menu = require('../menu.js');

const HearMenuReferenceSpecialsIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'HearMenuReferenceSpecialsIntent';
    },
    /**
     * User asks to hear the specials, prompt to hear details or add to order
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        console.log("In HearMenuReferenceSpecialsIntentHandler");
        let speakOutput, reprompt;
        // make a deep copy of the object and return a 'speakable' list
        let specials = menu.makeSpeakableList(JSON.parse(JSON.stringify(menu.getMenuReferenceSpecials())));
        speakOutput = handlerInput.t('MENU_REFERENCE_SPECIALS', {
            specials: specials
        });
        reprompt = handlerInput.t('MENU_REFERENCE_SPECIALS_REPROMPT');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.state = states.PROMPTED_TO_HEAR_BLUE_SHIFT_SPECIAL_DETAILS;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    },
}

module.exports = HearMenuReferenceSpecialsIntentHandler;