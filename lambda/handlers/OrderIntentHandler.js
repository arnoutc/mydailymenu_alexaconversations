import { getRequestType, getIntentName } from 'ask-sdk-core';

/**
 * Adding skill resumption to put the order in background.
 */
const OrderIntentHandler = {
    canHandle(handlerInput) {
        return getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
                && getIntentName(handlerInput.requestEnvelope) === 'OrderIntent';
    },
    handle(handlerInput) {
        console.log("In OrderIntentHandler");

        /**
         * Token exchange 
         */
        const userId = handlerInput.requestEnvelope.context.System.user.userId;
        console.log(`user id is ${userId}`);
       
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
        // let reprompt = handlerInput.t('PLACE_ORDER_REPROMPT');
    
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSessionBehavior("BACKGROUNDED")
            // .reprompt(reprompt)
            .getResponse();
    }
}

export default OrderIntentHandler;