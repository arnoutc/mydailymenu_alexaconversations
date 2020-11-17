const Alexa             = require('ask-sdk-core');
const _                 = require('lodash');
const menu              = require('../menu.js');
const AuthTokenHandler  = require('./AuthTokenHandler.js');
const AWS               = require('aws-sdk');

const {scheduleResumption } = require('./ResumeMyOrderHandler.js');

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

        const {sessionId} = handlerInput.requestEnvelope.sessionId;

        if(apiAccessToken){ //if Skill Resumption is enabled, use backgrounding
            console.log(`Found apiAccessToken ${apiAccessToken}, scheduling a resumption`);
            const sns = new AWS.SNS();
            const params = {
                Message: JSON.stringify({
                    endpoint: `https://api.eu.amazonalexa.com/v1/_customSkillSessions/${sessionId}/resume/`,
                    apiAccessToken,
                }),
                TopicArn: 'arn:aws:sns:us-east-1:054117929198:mydailymenu',
            }

            console.log(`Publishing ${params.Message} to SNS`);
            await sns.publish(params);

            return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSessionBehavior("BACKGROUNDED")
            .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse()
        } 
    }
}

module.exports = OrderIntentHandler;