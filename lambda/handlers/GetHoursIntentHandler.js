
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
}

module.exports = GetHoursIntentHandler;

