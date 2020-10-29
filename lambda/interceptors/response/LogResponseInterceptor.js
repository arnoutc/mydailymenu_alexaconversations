// *****************************************************************************
// This simple interceptor just log the incoming response bodies to assist in debugging.

const LogResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`RESPONSE = ${JSON.stringify(response)}`);
    },
}

module.exports = LogResponseInterceptor;