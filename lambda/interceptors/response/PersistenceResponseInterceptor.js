  // This response interceptor stores all session attributes into global persistent attributes
  // when the session ends and it stores the skill last used timestamp
  const PersistenceResponseInterceptor = { 
    process(handlerInput, responseOutput) { 
        if(handlerInput.requestEnvelope.session !== undefined){ 
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
    }
  };

  module.exports = PersistenceResponseInterceptor;