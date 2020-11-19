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

// IntentHandlers
const LaunchHandler                                 = require('./handlers/LaunchHandler.js');
const YesIntentHandler                              = require('./handlers/YesIntentHandler.js');
const NoIntentHandler                               = require('./handlers/NoIntentHandler.js');
//const BuildMyMenuIntentHandler                      = require('./handlers/BuildMyMenuIntentHandler.js');
const StartOverIntentHandler                        = require('./handlers/StartOverIntentHandler.js');
const OrderIntentHandler                            = require('./handlers/OrderIntentHandler.js');
const AddSomethingIntentHandler                     = require('./handlers/AddSomethingIntentHandler.js');
const StopIntentHandler                             = require('./handlers/StopIntentHandler.js');
const PauseIntentHandler                            = require('./handlers/PauseIntentHandler.js');
const CancelIntentHandler                           = require('./handlers/CancelIntentHandler.js');
const HelpIntentHandler                             = require('./handlers/HelpIntentHandler.js');
const WhatsInMyOrderIntentHandler                   = require('./handlers/WhatsInMyOrderIntentHandler.js');
const SessionEndedRequestHandler                    = require('./handlers/SessionEndedRequestHandler.js');
const GetHoursIntentHandler                         = require('./handlers/GetHoursIntentHandler.js');
const ContinueOrderIntentHandler                    = require('./handlers/ContinueOrderIntentHandler.js');
const HearMenuReferenceSpecialsIntentHandler        = require('./handlers/HearMenuReferenceSpecialsIntentHandler.js');
const HearSpecialDetailsIntentHandler               = require('./handlers/HearSpecialDetailsIntentHandler.js');
const AddMenuReferenceSpecialToOrderIntentHandler   = require('./handlers/AddMenuReferenceSpecialToOrderIntentHandler.js');
const ErrorHandler                                  = require('./handlers/ErrorHandler.js');
const OtherIntentHandler                            = require('./handlers/OtherIntentHandler.js');
const AuthorizationGrantHandler                     = require('./handlers/AuthorizationGrantHandler.js');
//const ResumeMyOrderHandler                          = require('./handlers/ResumeMyOrderHandler.js');
//const WhereIsMyOrderIntentHandler                   = require('./handlers/WhereIsMyOrderIntentHandler.js');

// interceptors
const BackgroundingRequestInterceptor               = require('./interceptors/request/BackgroundingRequestInterceptor.js');
const LocalizationInterceptor                       = require('./interceptors/request/LocalizationInterceptor.js');
const LogRequestInterceptor                         = require('./interceptors/request/LogRequestInterceptor');
const PersistenceRequestInterceptor                 = require('./interceptors/request/PersistenceRequestInterceptor.js');
const LogResponseInterceptor                        = require('./interceptors/response/LogResponseInterceptor');
const PersistenceResponseInterceptor                = require('./interceptors/response/PersistenceResponseInterceptor');

// Utility for parsing intent requests and API requests
const requestUtils  = require('./requestUtils');
// Static list of menu items with some helper functions
const menu          = require('./menu');

// Persistence
let persistenceAdapter;

// IMPORTANT: don't forget to give DynamoDB access to the role you're to run this lambda (IAM)
const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');

persistenceAdapter = new DynamoDbPersistenceAdapter({ 
    tableName: 'daily-menus',
    createTable: true
});


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

        console.log(`apiArguments ${JSON.stringify(apiArguments)}`);
        
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

const BuildMyMenuIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuildMyMenuIntent';
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
        AuthorizationGrantHandler,
        //ResumeMyOrderHandler,
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
