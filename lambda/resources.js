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
module.exports = {
    en: {
        translation: {
            WELCOME: "Welcome to My Daily Menu. Would you like to hear about our {{day}} {{period}} menu?",
            WELCOME_PERSONALIZED: "Hi <alexa:name type='first' personId='{{personId}}' />! <break /> {{prompt}}",
            WELCOME_BACK: "Welcome back to My Daily Menu. Would you like to continue with your existing order or start over",
            WELCOME_BACK_REPROMPT : "Sorry, I didn't catch that. Should we continue with your existing order or start a new one",
            
            REPEAT_ORDER_AND_CUSTOMIZE : "Your order has {{orderText}}. Would you like to customize the menu? or order as is",
            REPEAT_ORDER_AND_CUSTOMIZE_REPROMPT: "Sorry, I didn't catch that, did you want to customize this order? or order as is",
            REPEAT_ORDER_AND_ADD_SOMETHING : "Your order has {{orderText}}. Would you like to add something or order as is?",
            REPEAT_ORDER_AND_ADD_SOMETHING_REPROMPT: "Sorry, I didn't catch that, did you want to to add something or order as is?",
            
            WELCOME_REPROMPT : "Sorry, I didn't catch that. Just tell me to hear our menu or order a menu",
            
            GENERIC_REPROMPT: "Sorry, I didn't catch that, would you like to order a menu or maybe hear our menu options?",
            
            PROMPT_FOR_ACTION : "Ok. What would you like to do? You can ask to hear some of our menu options or just order your menu",
            
            HELP_PROMPT: "This skill is an Alexa Conversations implementation that simulates a menu ordering dialog flows using Alexa's artificial intelligence technology. You can ask me to order a menu, or hear our menu",
            
            REPROMPT_FOR_ACTION : "Sorry, I didnt catch that, what would you like to do?",
                        
            DAILY_BREAKFAST_SPECIAL: "Our {{day}} breakfast special comes with a {{breakfast}} with {{drinks}}. Would you like to order?",
            DAILY_LUNCH_SPECIAL: "Our {{day}} lunch special comes with a {{lunch}} with {{drinks}}. Would you like to order?",
            DAILY_DINNER_SPECIAL: "Our {{day}} dinner special comes with a {{dinner}} with {{drinks}}. Would you like to order?",
            DAILY_SPECIAL_REPROMPT: "Sorry, I didn't catch that. Would you like to order the {{day}} {{period}} special?",
            
            ORDER_DAILY_SPECIAL : "Ok, adding the {{day}} {{period}} special to your order. Would you like to add drinks?",
            ORDER_DAILY_SPECIAL_REPROMPT: "I've got your {{day}} {{period}} added to your order. Would you like to add drinks?",
            
            ADD_TO_ORDER : "Ok, you can ask for a list of drinks or just ask to add something by name",
            ADD_TO_ORDER_REPROMPT : "Sorry, I didn't catch that, you can ask for a list of drinks or just ask to add something by name",
            
            CONFIRM_DAILY_SPECIAL_ORDER : "Great! I've ordered the {{day}} {{period}} special. What would you like to do next?",
            CONFIRM_DAILY_SPECIAL_ORDER_REPROMPT: "Sorry, I didn't catch that. What would you like to do?",
            
            PLACE_ORDER: "Great! I placed your order for {{orderText}}. I'll let you know when it arrives. In the meantime, have you had a glass of water? , It’s important to keep drinking!",
            PLACE_ORDER_REPROMPT: "Your order has been placed, I'll let you know when it arrives. In the meantime, have you had a glass of water? , It’s important to keep drinking!",
            
            CURRENT_ORDER : "Your order has {{orderText}}. Did you want to continue with this order or start over",
            CURRENT_ORDER_REPROMPT: "Sorry, I didn't catch that. Should we continue with your existing order or start a new one",
            NO_CURRENT_ORDER : "You dont have any orders in progress, what would you like to do next?",
            NO_CURRENT_ORDER_REPROMPT: "Sorry, I didn't catch that. What would you like to do next?",
            
            MENU_REFERENCE_SPECIALS: "Our special menus are the {{specials}}. " +
                "You can ask me for details about one of the specials or to add one to your order",
            MENU_REFERENCE_SPECIALS_REPROMPT: "Did you want to hear more about a particular special?",
            
            REPEAT_MENU_REFERENCE_SPECIALS_AND_GET_NAME : "{{error}} Our specials are {{specials}}. Which one do you want to know more about?",
            REPEAT_MENU_REFERENCE_SPECIALS_AND_GET_NAME_REPROMPT: "Which special did you want details on?",
            MENU_REFERENCE_SPECIAL_DETAILS_PROMPT_TO_ORDER: "The {{name}} comes with {{qty}} {{breakfast}} {{lunch}} and {{dinner}}. Would you like to add it to your order?",
            MENU_REFERENCE_SPECIAL_DETAILS_PROMPT_TO_ORDER_REPROMPT: "Would you like to order the {{name}} special?",
            
            PROMPT_TO_CUSTOMIZE_SPECIAL: "Did you want to customize the {{name}} special at all?",
            PROMPT_TO_CUSTOMIZE_SPECIAL_REPROMPT: "Did you want to customize it?",
            
            GET_SPECIAL_MENU_NAME : "Which of our specials did you want to customize?",
            GET_SPECIAL_MENU_NAME_REPROMPT: "Which special did you want to customize?",
            MENU_ORDER_OPTIONS : "Ok, did you want to hear our menu specials or order a custom menu?",
            MENU_ORDER_OPTIONS_REPROMPT: "Would you like to hear our menu specials or order a custom menu?",
            SIDE_ORDER_OPTIONS : "Ok we have {{sides}}, what can I add to your order?",
            SIDE_ORDER_OPTIONS_REPROMPT : "Which side order would you like?",
            
            SALAD_ORDER_OPTIONS: "Ok, we have {{salads}}, what can I add to your order?",
            SALAD_ORDER_OPTIONS_REPROMPT: "Which salad would you like?",
            DRINK_ORDER_OPTIONS : "Ok we have {{drinks}}, what can I add to your order?",
            DRINK_ORDER_OPTIONS_REPROMPT: "What drinks would you like?",
            DESSERT_ORDER_OPTIONS : "Ok we have {{desserts}}, what can I add to your order?",
            DESSERT_ORDER_OPTIONS_REPROMPT: "What dessert would you like?",
            UNRECOGONIZED_ITEM : "Sorry, I don't think we have that on our menu. You can ask me to add menus or drinks to your order",
            PERMISSIONS_ERROR : "Please enable Location permissions in the Amazon Alexa app",
            NO_ADDRESS_SET: "Please enable Location permissions in the Amazon Alexa app.",
            FALLBACK: "Sorry, I didn't catch that. Say that again please.", 
            FALLBACK_REPROMPT: "Say that again please.",
            ERROR: "Sorry, something went wrong. Please try again later.",
            EXIT: "Speak to you later!",
            PAUSE: "Allright, pausing your order, let me know when you're ready"
        }
    }
};