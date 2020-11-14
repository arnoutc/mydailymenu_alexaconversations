const Alexa = require('ask-sdk-core');
const requestUtils = require('../requestUtils.js');
const states = require('../states.js');

// APL docs
const welcome_apl   = require('../launch_request.json');

// Skill Resumption
//const PERMISSIONS = ['alexa::skill:resumption'];

// *****************************************************************************
// Launch request handler.
// *****************************************************************************
const LaunchHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    /**
     * Launch request handler. 
     * on launching the skill, user gets the 'speechOutput' message of this handler. 
     * If user is silent or speaks something which is unrelated then user is reprompted with repromptOutput
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    async handle(handlerInput) {

        //check Skill Resumption permission

        // const consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
        // if (!consentToken) {
        //   return handlerInput.responseBuilder
        //     .speak(handlerInput.t('NOTIFY_MISSING_PERMISSIONS')
        //     .withAskForPermissionsConsentCard(PERMISSIONS)
        //     .getResponse());
        // }

        const personId = requestUtils.getPersonId(handlerInput);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {in_progress} = sessionAttributes;
        console.log('In LaunchHandler');
        console.log('sessionAttributes: ' + JSON.stringify(sessionAttributes));

        console.log(`LaunchHandler --- requestEnvelope is ${JSON.stringify(handlerInput.requestEnvelope)}`);
        
        let speakOutput, reprompt;
        // if they had 'in flight' orders that had not been moved to ordered.
        if(in_progress){
            console.log('in progress orders');
            if(personId){
                speakOutput = handlerInput.t('WELCOME_PERSONALIZED', {
                    personId: personId,
                    prompt: handlerInput.t('WELCOME_BACK')
                });
            } else {
                speakOutput = handlerInput.t('WELCOME_BACK');
            }
            reprompt = handlerInput.t('WELCOME_BACK_REPROMPT');
            // the in-progress prompt asks them if they'd like to customize anything
            // let's set that state for the Yes/No Intent Handlers
            sessionAttributes.state = states.PROMPTED_TO_CUSTOMIZE;
        } else {
            // no in progress orders
            console.log('no in progress orders');
            let {day, period} = await requestUtils.getDayAndPeriod(handlerInput);
            console.log('day ' + JSON.stringify(day));
            console.log('period ' + JSON.stringify(period));
            reprompt = handlerInput.t('WELCOME_REPROMPT');
            if (personId) {
                // Speaker is recognized, so greet by name
                speakOutput = handlerInput.t('WELCOME_PERSONALIZED', {
                    personId: personId,
                    prompt: handlerInput.t('WELCOME', {
                        day: day,
                        period: period
                    })
                });
            } else {
                // Speaker is not recognized; give a generic greeting asking if they would like to hear our specials
                speakOutput = handlerInput.t('WELCOME', {
                    day: day,
                    period: period
                });
            }
            // give context to yes/no response by saving state
            sessionAttributes.state = states.PROMPTED_FOR_DAILY_SPECIALS;
        }
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: "welcomeToken",
                document: welcome_apl
            });
        }
        return handlerInput.responseBuilder
                .speak(speakOutput)
                .withSimpleCard(
                    "Welcome", 
                    "Welcome to My Daily Menu?")
                .reprompt(reprompt)
                .getResponse();
    }
};

module.exports = LaunchHandler;