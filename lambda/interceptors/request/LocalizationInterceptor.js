const i18next       = require('i18next');
const sprintf       = require('sprintf-js').sprintf;
const _             = require('lodash');

// Localization strings
const resources     = require('../resources.js');

const LocalizationInterceptor = {
    process(handlerInput) {
        i18next
            .init({
                lng: _.get(handlerInput, 'requestEnvelope.request.locale'),
                overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
                resources: resources,
                returnObjects: true
            });
 
        handlerInput.t = (key, opts) => {
            const value = i18next.t(key, {...{interpolation: {escapeValue: false}}, ...opts});
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)]; // return a random element from the array
            } else {
                return value;
            }
        };
    }
}

module.exports = LocalizationInterceptor;