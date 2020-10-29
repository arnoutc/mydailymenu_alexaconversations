
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

module.exports = BackgroundingRequestInterceptor;