const Alexa = require('ask-sdk-core');
const _             = require('lodash');
const menu          = require('../menu.js');

//const {scheduleResumption } = require('./ResumeMyOrderHandler.js');

/**
 * Adding skill resumption to put the order in background.
 */
const OrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderIntent';
    },
    async handle(handlerInput) {
        console.log("In OrderIntentHandler");

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        _.defaults(sessionAttributes, {
            orders: []
        });
        const {in_progress} = sessionAttributes;
        let orderText = menu.generateOrderText(in_progress);
        sessionAttributes.orders.push({ 
            date : new Date().toISOString(),
            order: in_progress
        });  
        let speakOutput = handlerInput.t('PLACE_ORDER', {
            orderText : orderText
        });

        //let reprompt = handlerInput.t('PLACE_ORDER_REPROMPT');

        // scheduleResumption(stage.value.toLowerCase(), region.value.toLowerCase(), sessionId, apiAccessToken, delay.value)
        //     .then((data) => console.log(`MessageID is ${data.MessageId}`))
        //     .catch((err) => console.error(err, err.stack));

        return handlerInput.responseBuilder
        .speak(speakOutput)
        .withSessionBehavior("BACKGROUNDED")
        .getResponse();
        
    }
}

module.exports = OrderIntentHandler;