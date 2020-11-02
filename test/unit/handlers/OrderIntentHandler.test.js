const OrderIntentHandler = require('../../../lambda/handlers/OrderIntentHandler.js');

describe('OrderIntentHandler', () => {

    let speakMock = jest.fn(() => handlerInput.responseBuilder);
    let getResponseMock = jest.fn(() => handlerInput.responseBuilder);

    let handlerInput = {
        responseBuilder: {
        speak: speakMock,
        getResponse: getResponseMock
        },
        requestEnvelope: {
            request: {
                type: 'IntentRequest',
                intent: {
                    name: 'OrderIntent'
                }
            }
        }
    }
    
    it('should be able to handle requests', () => {
        expect(OrderIntentHandler.canHandle(handlerInput)).toEqual(true);
    });

    it('should greet the user with a message', () => {
        OrderIntentHandler.handle(handlerInput);
    });
});