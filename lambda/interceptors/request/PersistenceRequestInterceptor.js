const Alexa = require('ask-sdk-core');

/** 
 * This request interceptor with each new session loads all global persistent attributes
 * into the session attributes and increments a launch counter 
*/
const PersistenceRequestInterceptor = { 
    process(handlerInput) { 
        console.log(`PersistenceRequestInterceptor  -- start `);
        if(Alexa.isNewSession(handlerInput.requestEnvelope )) { 
            console.log(`PersistenceRequestInterceptor  -- new session`);
                return new Promise((resolve, reject) => { 
                    handlerInput.attributesManager.getPersistentAttributes() 
                        .then((persistentAttributes) => { 
                            persistentAttributes = persistentAttributes || {};
                            if(!persistentAttributes['launchCount'])
                              persistentAttributes['launchCount'] = 0;
                            persistentAttributes['launchCount'] += 1; 
                            console.log(`PersistenceRequestInterceptor  -- launchCount incremented`);
                            handlerInput.attributesManager.setSessionAttributes(persistentAttributes); 
                            console.log(`PersistenceRequestInterceptor  -- persistentAttributes ${JSON.stringify(persistentAttributes)}`);
                            resolve();
                        })
                        .catch((err) => { 
                          reject(err); 
                      });
                }); 
            
        
        } // end session['new'] 
    } 
  }

  module.exports = PersistenceRequestInterceptor;