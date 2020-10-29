/**
 * Copyright 2020 Amazon.com, Inc. and its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * 
 * Licensed under the Amazon Software License (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 * 
 * http://aws.amazon.com/asl/
 * 
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
**/
'use strict';
const Alexa         = require('ask-sdk');
const i18next       = require('i18next');
const sprintf       = require('sprintf-js').sprintf;
const _             = require('lodash');

// IntentHandlers
const LaunchHandler = require('./handlers/LaunchHandler.js');
const YesIntentHandler = require('./handlers/YesIntentHandler.js');
const NoIntentHandler = require('./NoIntentHandler.js');
const OrderIntentHandler = require('./handlers/OrderIntentHandler.js');

// Localization strings
const resources     = require('./resources')
// Utility for parsing intent requests and API requests
const requestUtils  = require('./requestUtils');
// Static list of menu items with some helper functions
const menu          = require('./menu');
// Static list of states
const states        = require('./states');

// Persistence
let persistenceAdapter;

// IMPORTANT: don't forget to give DynamoDB access to the role you're to run this lambda (IAM)
const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
persistenceAdapter = new DynamoDbPersistenceAdapter({ 
    tableName: 'daily-menus',
    createTable: true
});

const AddMenuReferenceSpecialToOrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddMenuReferenceSpecialToOrderIntent'
    },
    handle(handlerInput){
        let speakOutput, reprompt;
        console.log("In AddMenuReferenceSpecialToOrderIntentHandler");

        const specialSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'special');
        const firstAuthority = _.first(_.get(specialSlot, 'resolutions.resolutionsPerAuthority'));
        const special = _.first(_.get(firstAuthority, 'values')).value.name;
        
        // the user answered yes to ordering one of the special menus
        speakOutput = handlerInput.t('PROMPT_TO_CUSTOMIZE_SPECIAL',{
            name: special
        });
        reprompt = handlerInput.t('PROMPT_TO_CUSTOMIZE_SPECIAL_REPROMPT');
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.state = states.PROMPTED_TO_CUSTOMIZE_SPECIAL_MENU;
    
        // lets save this order as in-progress
        sessionAttributes.in_progress = {special : menu.getSpecialMenuDetails(special)};
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}
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

const WhatsInMyOrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhatsInMyOrderIntent'
    },
    handle(handlerInput){
        // They are asking what's in their current order
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {in_progress} = sessionAttributes;
        let speakOutput, reprompt;
        // they dont have an in progress order
        if(!in_progress){
            speakOutput = handlerInput.t('NO_CURRENT_ORDER', {
                orderText: menu.generateOrderText(in_progress)
            });
            reprompt = handlerInput.t('NO_CURRENT_ORDER_REPROMPT');
        } else {
            speakOutput = handlerInput.t('CURRENT_ORDER', {
                orderText: menu.generateOrderText(in_progress)
            });
            reprompt = handlerInput.t('CURRENT_ORDER_REPROMPT');
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}

const ContinueOrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ContinueOrderIntent'
    },

    /**
     * ContinueOrderIntent handler. 
     * 
     * Triggered when the user has an existing order in their persisted attributes that hasnt been moved to orders
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        // lets get the in_progress order
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {in_progress} = sessionAttributes;
        let orderText = menu.generateOrderText(in_progress);
        let speakOutput, reprompt;
        // let's repeat their order to confirm its still what they want
        speakOutput = handlerInput.t('REPEAT_ORDER_AND_ADD_SOMETHING', { 
            orderText : orderText
        });
        reprompt = handlerInput.t('REPEAT_ORDER_AND_ADD_SOMETHING_REPROMPT');
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt) 
            .getResponse();
    }
};

const AddSomethingIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AddSomethingIntent';
    },
    /**
     * The user asked to add something to their order. Depending on what they asked to add
     * lets give them a list of options.
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        console.log("In AddSomethingIntentHandler");
        let speakOutput, reprompt;
        const itemSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'item');
        const firstAuthority = _.first(_.get(itemSlot, 'resolutions.resolutionsPerAuthority'));
        const item = _.first(_.get(firstAuthority, 'values')).value.name;
        if (item === 'menu'){
            speakOutput = handlerInput.t('MENU_ORDER_OPTIONS');
            reprompt = handlerInput.t('MENU_ORDER_OPTIONS_REPROMPT');
        } else if (item === 'drink'){
            speakOutput = handlerInput.t('DRINK_ORDER_OPTIONS',{
                drinks : menu.makeSpeakableList(menu.getDrinks())
            });
            reprompt = handlerInput.t('DRINK_ORDER_OPTIONS_REPROMPT');
        } else {
            speakOutput = handlerInput.t('UNRECOGONIZED_ITEM');
            reprompt = handlerInput.t('UNRECOGONIZED_ITEM_REPROMPT');
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}
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
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    /**
     * User asked for help
     *
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */
    handle(handlerInput) {
        console.log("In HelpIntentHandler");
        let speakOutput, reprompt;
       
        speakOutput = handlerInput.t('HELP_PROMPT');
        reprompt = handlerInput.t('GENERIC_REPROMPT');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard(
                "Help", 
                "What can I help you with today?")
            .reprompt(reprompt)
            .getResponse();
    },
};
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
};
const BuildMyMenuIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'BuildMyMenuIntent';
    },
    handle(handlerInput) {
        console.log("In BuildMyMenuIntentHandler");
        const breakfastSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'breakfast');
        console.log('envelopes are ' + JSON.stringify(handlerInput.requestEnvelope));
        console.log('breakfastSlot is ' + JSON.stringify(breakfastSlot));
        
        if ( breakfastSlot  && breakfastSlot.value ){
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
                            name: 'orderBreakfast',
                            slots: {
                                name: {
                                    name: 'breakfast',
                                    value: breakfastSlot.value
                                }
                            }
                        }
                    }
                })
                .getResponse();
        }

        const lunchSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'lunch');
        console.log('lunchSlot is ' + JSON.stringify(lunchSlot));
        if ( lunchSlot && lunchSlot.value ){
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
                            name: 'orderLunch',
                            slots: {
                                name: {
                                    name: 'lunch',
                                    value: lunchSlot.value
                                }
                            }
                        }
                    }
                })
                .getResponse();
        }

        const dinnerSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'dinner');
        console.log('dinnerSlot is ' + JSON.stringify(dinnerSlot));
        if ( dinnerSlot && dinnerSlot.value ){
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
                            name: 'orderDinner',
                            slots: {
                                name: {
                                    name: 'dinner',
                                    value: dinnerSlot.value
                                }
                            }
                        }
                    }
                })
                .getResponse();
        }
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
                        name: 'startMenuOrder'
                    }
                }
            })
            .getResponse();
    }
};
const GetHoursIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetHoursIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
        const consentToken = requestEnvelope.context.System.user.permissions && requestEnvelope.context.System.user.permissions.consentToken;
        
        if (!consentToken) {
          return responseBuilder
            .speak(handlerInput.t('PERMISSIONS_ERROR'))
            .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
            .getResponse();
        }
        try {
          const { deviceId } = requestEnvelope.context.System.device;
          const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
          const address = await deviceAddressServiceClient.getFullAddress(deviceId);
       
          let response;
          if (address.addressLine1 === null && address.stateOrRegion === null) {
            response = responseBuilder.speak(handlerInput.t('NO_ADDRESS_SET')).getResponse();
          } else {
            const city = address.city;
            let prompt = handlerInput.t('CLOSEST_LOCATION', {
                city: city
            });
            let reprompt = handlerInput.t('GENERIC_REPROMPT')
            response = responseBuilder.speak(prompt)
            .reprompt(reprompt)
            .getResponse();
          }
          return response;
        } catch (error) {
          if (error.name !== 'ServiceError') {
            const response = responseBuilder.speak(handlerInput.t('ERROR')).getResponse();
            return response;
          }
          throw error;
        }
      }
};
// *****************************************************************************
// This is the default intent handler to handle all intent requests.
const OtherIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name !== 'GetSpecialtyMenuListIntent' && request.intent.name !== 'BuildMyMenuIntent';
    },

    /**
     * If user says something which is not handled by the specific intent handlers, then the request should be handled by this default
     * Intent handler. This prompts the user to select one of our defined Intents. For now, GetSpecialtyMenuListIntent and BuildMyMenuIntent
     * 
     * @param handlerInput {HandlerInput}
     * @returns {Response}
     */

    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        console.log('In catch all intent handler. Intent invoked: ' + intentName);
        const speechOutput = handlerInput.t('GENERIC_REPROMPT');

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};
const StopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput){
        let speechOutput = handlerInput.t('EXIT');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
}

const PauseIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PauseIntent';
    },
    handle(handlerInput){
        let speechOutput = handlerInput.t('PAUSE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withSessionBehavior("BACKGROUNDED")
            .getResponse();
    }
}

/**
 * For Skill Resumption, when user actively pauses the interaction
 */
// const WhereIsMyOrderIntentHandler = {
//     canHandle(handlerInput) {
//         const request = handlerInput.requestEnvelope.request;
//         return request.type === 'IntentRequest' && request.intent.name === 'WhereIsMyOrderIntent';
//     },
//     handle(handlerInput){
//         let speechOutput = handlerInput.t('PAUSE');
//         return handlerInput.responseBuilder
//             .speak(speechOutput)
//             .getResponse();
//     }
// }

const CancelIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput){
        let speechOutput = handlerInput.t('PROMPT_FOR_ACTION');
        let reprompt = handlerInput.t('GENERIC_REPROMPT');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}
// *****************************************************************************
// Alexa Conversations API request handlers. Called by the Alexa Conversations platform when AMAZON.Conversations is the
// focused dialog manager. These can instead be specified using the private SDK with execute() methods and the skill
// builder addApiRequestHandler(). To work with the public SDK, these are written as generic request handlers.

const OrderMenu = {
    canHandle(handlerInput) {
        return requestUtils.isApiRequest(handlerInput, 'OrderMenu');
    },

    /**
     * OrderMenu API
     * Consumes: TBD
     * Returns: Valid custom menu order from Alexa Conversations
     *
     * @param handlerInput {HandlerInput}
     * @return {Promise<Response>}
     */
    handle(handlerInput) {
        console.log('in OrderMenu');
        const apiArguments = requestUtils.getApiArguments(handlerInput);
        console.log('apiArguments ' + apiArguments);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.in_progress = {menu : apiArguments};

        return {
            directives : [{
                type: 'Dialog.DelegateRequest',
                target: 'skill',
                period: {
                    until: 'EXPLICIT_RETURN'
                },
                updatedRequest: {
                    type: 'IntentRequest',
                    intent: {
                        name: 'OrderIntent',
                    }
                }}],
                apiResponse :{}
            }
        }
};

const GetMenuDetails = {
    canHandle(handlerInput) {
        return requestUtils.isApiRequest(handlerInput, 'GetMenuDetails');
    },
    /**
     * Returns the menu detail
     *
     * @param handlerInput {HandlerInput}
     * @returns {Promise<Response>}
     */
    handle(handlerInput) {
        console.log("In GetMenuDetails API Handler");
        const apiArguments = requestUtils.getApiArguments(handlerInput);
        let special = menu.getSpecialMenuDetails(apiArguments.name);
        return {
            apiResponse: {
                special
            }
         };
    }
};

const MenuQuestion = {
    canHandle(handlerInput) {
        return requestUtils.isApiRequest(handlerInput, 'MenuQuestion');
    },
    /**
     * Returns the special menu detail from the menu
     *
     * @param handlerInput {HandlerInput}
     * @returns {Promise<Response>}
     */
    handle(handlerInput) {
        console.log("In API handler MenuQuestion")
        const apiArguments = requestUtils.getApiArguments(handlerInput);
        const slots = requestUtils.getApiSlots(handlerInput);
        console.log(JSON.stringify(apiArguments));
        console.log(JSON.stringify(slots));
        let optionValue = apiArguments.option;
        let optionResponse = "Your choices of ";
        if (slots){
             optionValue = slots.option.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        }
        if (optionValue === 'size'){
            optionResponse += 'size are small, medium, large, and extra large';
        } else if (optionValue === 'crust'){
            optionResponse += 'crust are thin crust, deep dish, regular and brooklyn style';
        } else if (optionValue === 'cheese'){
            optionResponse += 'cheese are no cheese, light, normal, extra cheese or double cheese';
        }
        optionResponse += ", what would you like"
    
        return {
            apiResponse: {
                optionResponse
            }
        };
    }
}
// *****************************************************************************
// Generic session-ended handling logging the reason received, to help debug in error cases.

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        console.log(`Session ended with reason: ${request.reason} ${request.error.type} ${request.error.message} `);
        return handlerInput.responseBuilder.getResponse();
    },
};

// *****************************************************************************
// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`);
        console.error(`Error stack`, JSON.stringify(error.stack));
        console.error(`Error`, JSON.stringify(error));

        let speechOutput, reprompt;
        speechOutput = handlerInput.t('GENERIC_REPROMPT');
        reprompt = handlerInput.t('REPROMPT_FOR_ACTION');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .getResponse();
    },
};

// *****************************************************************************
// These simple interceptors just log the incoming and outgoing request bodies to assist in debugging.

const LogRequestInterceptor = {
    process(handlerInput) {
        console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
    },
};

const LogResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`RESPONSE = ${JSON.stringify(response)}`);
    },
};
const LocalizationInterceptor = {
    process(handlerInput) {
        i18next
            .init({
                lng: _.get(handlerInput, 'requestEnvelope.request.locale'),
                overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
                resources: resources,
                returnObjects: true
            });
 
        handlerInput.t = (key, opts) => {
            const value = i18next.t(key, {...{interpolation: {escapeValue: false}}, ...opts});
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)]; // return a random element from the array
            } else {
                return value;
            }
        };
    }
};

/**
 * Background Request Interceptor
 */
 const BackgroundingRequestInterceptor = {
     async process(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        const response = responseBuilder.getResponse();
        responseBuilder.withSessionBehavior = function (state) {
            response.sessionBehavior = {
                "type": "SetSessionState",
                "state": state
            };
            return responseBuilder;
        }
        console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
    },
}
 

// This request interceptor with each new session loads all global persistent attributes
// into the session attributes and increments a launch counter
const PersistenceRequestInterceptor = { 
    process(handlerInput) { 
        if(handlerInput.requestEnvelope.session['new']) { 
            return new Promise((resolve, reject) => { 
                handlerInput.attributesManager.getPersistentAttributes() 
                    .then((persistentAttributes) => { 
                        persistentAttributes = persistentAttributes || {};
                        if(!persistentAttributes['launchCount'])
                          persistentAttributes['launchCount'] = 0;
                        persistentAttributes['launchCount'] += 1; 
                        handlerInput.attributesManager.setSessionAttributes(persistentAttributes); 
                        resolve();
                    })
                    .catch((err) => { 
                      reject(err); 
                  });
            }); 
        } // end session['new'] 
    } 
  };
  
  // This response interceptor stores all session attributes into global persistent attributes
  // when the session ends and it stores the skill last used timestamp
  const PersistenceResponseInterceptor = { 
    process(handlerInput, responseOutput) { 
        console.log('in PersistenceResponseInterceptor');
        console.log(`responseOutput JSON is ${JSON.stringify(responseOutput)}`);
        const ses = (typeof responseOutput.shouldEndSession === 'undefined' ? true : responseOutput.shouldEndSession); 
        if(ses || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') { // skill was stopped or timed out 
            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime(); 
            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes); 
            return new Promise((resolve, reject) => { 
                handlerInput.attributesManager.savePersistentAttributes() 
                    .then(() => { 
                        resolve(); 
                    }) 
                    .catch((err) => { 
                        reject(err); 
                    }); 
            }); 
        } 
    } 
  };

// *****************************************************************************
// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters in lists: they're processed top to bottom.
module.exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(        
        LaunchHandler,
        YesIntentHandler,
        NoIntentHandler,
        OrderIntentHandler,
        StartOverIntentHandler,
        AddSomethingIntentHandler,
        StopIntentHandler,
        PauseIntentHandler,
        CancelIntentHandler,
        HelpIntentHandler,
        WhatsInMyOrderIntentHandler,
        SessionEndedRequestHandler,
        GetHoursIntentHandler,
        ContinueOrderIntentHandler,
        HearMenuReferenceSpecialsIntentHandler,
        HearSpecialDetailsIntentHandler,
        AddMenuReferenceSpecialToOrderIntentHandler,
        BuildMyMenuIntentHandler,
        OtherIntentHandler,
        OrderMenu,
        MenuQuestion,
        GetMenuDetails,
        //WhereIsMyOrderIntentHandler,
        )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(LogRequestInterceptor, LocalizationInterceptor, BackgroundingRequestInterceptor, 
        PersistenceRequestInterceptor)
    .addResponseInterceptors(LogResponseInterceptor, PersistenceResponseInterceptor)
    .withPersistenceAdapter(persistenceAdapter)
    .withApiClient(new Alexa.DefaultApiClient)
    .withCustomUserAgent('my-daily-menu-skill/v1')
    .lambda();
