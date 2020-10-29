

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
}

module.exports = SessionEndedRequestHandler;