const Alexa = require('ask-sdk-core');

/** 
 * This request interceptor with each new session loads all global persistent attributes
 * into the session attributes and increments a launch counter 
*/
const PersistenceRequestInterceptor = { 
    process(handlerInput) { 
        if(Alexa.isNewSession(handlerInput.requestEnvelope)) { 
            try{
                return new Promise((resolve, reject) => { 
                    handlerInput.attributesManager.getPersistentAttributes() 
                        .then((persistentAttributes) => { 
                            persistentAttributes = persistentAttributes || {};
                            if(!persistentAttributes['launchCount'])
                              persistentAttributes['launchCount'] = 0;
                            persistentAttributes['launchCount'] += 1; 
                            handlerInput.attributesManager.setSessionAttributes(persistentAttributes); 
                            resolve();
                        })
                        .catch((err) => { 
                          reject(err); 
                      });
                }); 
            } catch(error){
                console.log(`Error calling Alexa ${error}`);
            }

        } // end session['new'] 
    } 
  }

  module.exports = PersistenceRequestInterceptor;