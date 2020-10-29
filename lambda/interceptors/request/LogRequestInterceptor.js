// *****************************************************************************
// This simple interceptor just log the incoming request bodies to assist in debugging.

const LogRequestInterceptor = {
    process(handlerInput) {
        console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
    },
};

module.exports = LogRequestInterceptor;