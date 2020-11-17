const Alexa = require('ask-sdk-core');

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

module.exports = BuildMyMenuIntentHandler;