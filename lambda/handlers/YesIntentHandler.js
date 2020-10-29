const Alexa = require('ask-sdk-core');
const requestUtils = require('../requestUtils.js');
const states = require('../states.js');
const menu = require('../menu.js');

/**
 * AMAZON.YesIntentHandler. 
 * 
 * Used in response to 
 *  - being prompted to hear the daily specials
 *  - ordering a daily special
 *  
 * @param handlerInput {HandlerInput}
 * @returns {Response}
 */
const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
    },
    async handle(handlerInput) {
        let speakOutput, reprompt;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        console.log('In YesIntentHandler');
        console.log('sessionAtrributes ' + JSON.stringify(sessionAttributes));
        let {day, period} = await requestUtils.getDayAndPeriod(handlerInput);
        // if we just prompted them for specials
        if (sessionAttributes.state == states.PROMPTED_FOR_DAILY_SPECIALS){
            console.log("Getting daily special for " + period + " on " + day);
            // copying to new object to not mess up downstream storage of object in session
            let spoken_special = JSON.parse(JSON.stringify(menu.getDailySpecialForPeriod(day, period)));
            console.log('Daily special: ' + JSON.stringify(spoken_special));
            if (period === "breakfast"){
                speakOutput = handlerInput.t('DAILY_BREAKFAST_SPECIAL', {
                    day: day,
                    breakfast: spoken_special.menu.breakfast,
                    lunch: spoken_special.menu.lunch,
                    dinner: spoken_special.menu.dinner,
                    drinks: spoken_special.drinks
                });
            } else if (period == "lunch") {
                speakOutput = handlerInput.t('DAILY_LUNCH_SPECIAL', {
                    day: day,
                    breakfast: spoken_special.menu.breakfast,
                    lunch: spoken_special.menu.lunch,
                    dinner: spoken_special.menu.dinner,
                    drinks: spoken_special.drinks
                });
            } else {
                speakOutput = handlerInput.t('DAILY_DINNER_SPECIAL', {
                    day: day,
                    breakfast: spoken_special.menu.breakfast,
                    lunch: spoken_special.menu.lunch,
                    dinner: spoken_special.menu.dinner,
                    drinks: spoken_special.drinks
                });
            }
            reprompt = handlerInput.t('DAILY_SPECIAL_REPROMPT',{
                day: day,
                period: period
            });
            sessionAttributes.state = states.PROMPTED_TO_ORDER_DAILY_SPECIAL;
        } else if(sessionAttributes.state == states.PROMPTED_TO_ORDER_DAILY_SPECIAL){
            let daily_special = menu.getDailySpecialForPeriod(day, period);
            // the user answered 'yes' to ordering the daily special
            speakOutput = handlerInput.t('ORDER_DAILY_SPECIAL',{
                day: day,
                period: period
            });
            reprompt = handlerInput.t('ORDER_DAILY_SPECIAL_REPROMPT',{
                day: day,
                period: period
            });
            // let the system know we prompted to customize the menu or salad
            sessionAttributes.state = states.PROMPTED_TO_ADD_TO_ORDER;

            // lets save this order as in-progress
            sessionAttributes.in_progress = daily_special;
        } else if (sessionAttributes.state == states.PROMPTED_TO_ADD_TO_ORDER){
            // the user answered 'yes' to customizing something, lets find out which
            speakOutput = handlerInput.t('ADD_TO_ORDER',);
            reprompt = handlerInput.t('ADD_TO_ORDER_REPROMPT');
        } else if (sessionAttributes.state == states.PROMPTED_TO_ORDER_SPECIAL){
            // the user answered yes to ordering one of the special menus
            speakOutput = handlerInput.t('PROMPT_TO_CUSTOMIZE_SPECIAL',{
                name: sessionAttributes.specialName
            });
            reprompt = handlerInput.t('PROMPT_TO_CUSTOMIZE_SPECIAL_REPROMPT');
            sessionAttributes.state = states.PROMPTED_TO_CUSTOMIZE_SPECIAL_MENU;
          
            // lets save this order as in-progress
            sessionAttributes.in_progress = {special : menu.getSpecialMenuDetails(sessionAttributes.specialName)};
        } else if (sessionAttributes.state == states.PROMPTED_TO_CUSTOMIZE_SPECIAL_MENU){
            // user answered yes to customizing a menu
            // send this to Alexa Conversations for customize special menu
            let name = sessionAttributes.in_progress.special.name;
            // if we dont have a special name, lets ask for it again
            if (!name){
                speakOutput = handlerInput.t('GET_SPECIAL_MENU_NAME');
                reprompt = handlerInput.t('GET_SPECIAL_MENU_NAME_REPROMPT');
            } else {
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
                                        name : 'name',
                                        value: name
                                    }
                                }
                            }
                        }
                    })
                    .getResponse();
            }
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};

module.exports = YesIntentHandler;