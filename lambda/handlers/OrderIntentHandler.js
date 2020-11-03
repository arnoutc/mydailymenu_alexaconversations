const Alexa = require('ask-sdk-core');
const _             = require('lodash');
const menu          = require('../menu.js');
const AuthorizationGrantHandler = require('./AuthorizationGrantHandler.js');

const AuthTokenHandler =  require('./AuthTokenHandler.js');
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


        /**
         * Token exchange 
         */
        const apiAccessToken = await AuthTokenHandler.getToken(Alexa.getUserId(handlerInput.requestEnvelope))

        if (apiAccessToken) {
        console.log(`Found apiAccessToken ${apiAccessToken}, scheduling a resumption`);
        
        // scheduleResumption(stage.value.toLowerCase(), region.value.toLowerCase(), sessionId, apiAccessToken, delay.value)
        //     .then((data) => console.log(`MessageID is ${data.MessageId}`))
        //     .catch((err) => console.error(err, err.stack));

            return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSessionBehavior("BACKGROUNDED")
            .getResponse();
        } else {
            //redirect the user to the Alexa app to grant permission
            console.log(`initiate token exchange and persist token in Dynamodb table of request envelope: ${JSON.stringify(handlerInput.requestEnvelope)} from user ${Alexa.getUserId(handlerInput.requestEnvelope)}`);

            const response =  AuthorizationGrantHandler.handle(handlerInput.requestEnvelope);
            console.log(`handle --- response returned is ${JSON.stringify(response)}`);

        }
    }
}

module.exports = OrderIntentHandler;