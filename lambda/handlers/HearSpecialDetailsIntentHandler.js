const Alexa = require('ask-sdk-core');
const states = require('../states.js');
const menu = require('../menu.js');
const _ = require('lodash');

const HearSpecialDetailsIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'HearSpecialDetailsIntent';
    },
    /**
     * User asks to hear the specials, prompt to hear details or add to order
     * Since these utterances are the same for clarifying which special they want to customize, 
     * we will check for that state as well
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        console.log("In HearSpecialDetailsIntentHandler");
        let speakOutput, reprompt;
        // get the name of the special
        const specialNameSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'special');
        const firstAuthority = _.first(_.get(specialNameSlot, 'resolutions.resolutionsPerAuthority'));
        const specialName = _.first(_.get(firstAuthority, 'values')).value.name;

        console.log(JSON.stringify(specialNameSlot));
        console.log("heard [" + specialName + "] as the special name")
        // if they didnt pass us a name and just asked for details 'on a special', lets prompt again for name
        if (!specialName){
            let specials = menu.makeSpeakableList(JSON.parse(JSON.stringify(menu.getMenuReferenceSpecials())));
            speakOutput = handlerInput.t('REPEAT_MENU_REFERENCE_SPECIALS_AND_GET_NAME', {
                specials: specials
            });
            reprompt = handlerInput.t('REPEAT_MENU_REFERENCE_SPECIALS_AND_GET_NAME_REPROMPT');
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(reprompt)
                .getResponse()
        }
        // if they passed in a name, but its not a special
        if (!menu.getMenuReferenceSpecials().includes(specialName)){
            let specials = menu.makeSpeakableList(JSON.parse(JSON.stringify(menu.getMenuReferenceSpecials())));
            speakOutput = handlerInput.t('REPEAT_MENU_REFERENCE_SPECIALS_AND_GET_NAME', {
                specials: specials,
                error: "Sorry, I dont recognize " + specialName + " as one of our specials."
            });
            reprompt = handlerInput.t('REPEAT_MENU_REFERENCE_SPECIALS_AND_GET_NAME_REPROMPT');
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(reprompt)
                .getResponse()

        }
        // if we get here, we have a valid special name
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        // if we are re-prompting them for the special name and they indicated they wanted to customize
        if (sessionAttributes.state == states.PROMPTED_TO_CUSTOMIZE_SPECIAL_MENU){
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.DelegateRequest',
                    target: 'AMAZON.Conversations',
                    period: {
                        until: 'EXPLICIT_RETURN' 
                    },
                    updatedRequest: {
                        type: 'Dialog.InputRequest',
                        input: {
                            name: 'customizeMenuReferenceSpecial',
                            slots: {
                                name: {
                                    name: 'name',
                                    value: specialName
                                }
                            }
                        }
                    }
                })
                .getResponse();
        }
        const special = menu.getSpecialMenuDetails(specialName);
        speakOutput = handlerInput.t('MENU_REFERENCE_SPECIAL_DETAILS_PROMPT_TO_ORDER', {
            name : special.name,
            qty : special.qty,
            breakfast : special.menu.breakfast,
            lunch : special.menu.lunch,
            dinner : special.menu.dinner,
            //cost: special.cost
        });
        reprompt = handlerInput.t('MENU_REFERENCE_SPECIAL_DETAILS_PROMPT_TO_ORDER_REPROMPT', {
            name: special.name
        });
        sessionAttributes.state = states.PROMPTED_TO_ORDER_SPECIAL;
        sessionAttributes.specialName = specialName;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    },
}

module.exports = HearSpecialDetailsIntentHandler;