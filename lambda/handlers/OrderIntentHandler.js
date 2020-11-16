const Alexa             = require('ask-sdk-core');
const _                 = require('lodash');
const menu              = require('../menu.js');
const AuthTokenHandler  = require('./AuthTokenHandler.js');

//const {scheduleResumption } = require('./ResumeMyOrderHandler.js');

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

        /* 
            Check if the user has granted permissions for the skill to read and write reminders.
            If the permissions has not been granted, send an AskForPermissionsConsent card to the Alexa Companion mobile app.
            Reference: https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#permissions-card-for-requesting-customer-consent
        */
       const apiAccessToken = await AuthTokenHandler.getToken(Alexa.getUserId(handlerInput.requestEnvelope));
       console.log(`OrderIntentHandler --- apiAccessToken is ${JSON.stringify(apiAccessToken)}`);

    //    if (apiAccessToken) {
    //      console.log(`Found apiAccessToken ${apiAccessToken}, scheduling a resumption`);
    //      scheduleResumption(stage.value.toLowerCase(), region.value.toLowerCase(), sessionId, apiAccessToken, delay.value)
    //        .then((data) => console.log(`MessageID is ${data.MessageId}`))
    //        .catch((err) => console.error(err, err.stack));
    //    }

        if(apiAccessToken){ //if Skill Resumption is enabled, use backgrounding
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSessionBehavior("BACKGROUNDED")
            .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                //.withAskForPermissionsConsentCard(['alexa::skill:resumption'])
                .getResponse()
        } 
    }
}

module.exports = OrderIntentHandler;