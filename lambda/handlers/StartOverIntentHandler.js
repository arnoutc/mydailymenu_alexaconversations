const Alexa     = require('ask-sdk-core');
const states    = require('../states.js');

const StartOverIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartOverIntent'
    },
    handle(handlerInput){
        // they answered 'start over' when asked to customize/resume their in progress order
        // lets delete that state if saved
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (sessionAttributes.state == states.PROMPTED_TO_CUSTOMIZE){
            if (sessionAttributes.in_progress){
                delete sessionAttributes.in_progress;
            }
        }
        let speakOutput, reprompt;
        speakOutput = handlerInput.t('PROMPT_FOR_ACTION');
        reprompt = handlerInput.t('REMPROMPT_FOR_ACTION');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}

module.exports = StartOverIntentHandler;