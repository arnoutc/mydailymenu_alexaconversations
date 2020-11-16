## My Daily Menu Alexa Skill
This project is an adaptation of the boiler place Alexa Conversations skill https://github.com/alexa/alexa-cookbook/tree/master/feature-demos/alexa-conversations/pizza-reference-skill that also includes Skill Resumption.

## Motivation
This project is meant to be a proof-of-concept to demonstrate to PA internally the skill resumption funcationality. The project has
not been shared yet with the PA Voice Capability and is just maintained by myself for now.

## Build status
This project is build manually, due to ask deploy not working for Alexa Conversations. I deploy with the commands:

ask deploy --target skill-infrastructure
cp .ask/lambda/build.zip .
the zip is uploaded manually to the AWS Lambda

## Screenshots

## Tech/framework used
The framework used is NodeJS 15, the Lambda is using Node v12

<b>Built with</b>
- [Node](https://nodejs.org/en/blog/release/v15.0.0/)

## Features
The project tries to implement Alexa Skill Resumption as well as Alexa Conversations. The Skill resumption, however, should work just on the standard OrderIntent and not on any other intents

## Code Run through

The entry point index.js calls various generic functions and then pulls in handlers and interceptors. The handlers and interceptors 
are stored in separate modules in subfolders under lambda. The constants used are stored in resources.js and states.js and some utilities are stored in requestUtils.js.

## Installation
Provide step by step series of examples and explanations about how to get a development env running.

## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.

## Tests
The project includes some initial setup of jest with tests commented in jest.config.js. Also bespoken has been set up in testing.json however just used fo some initial handler testing.

## How to use?
If people like your project they’ll want to learn how they can use it. To do so include step by step guide to use your project.

## Contribute

Let people know how they can contribute into your project. A [contributing guideline](https://github.com/zulip/zulip-electron/blob/master/CONTRIBUTING.md) will be a big plus.

## Credits
Thanks for all the help to the Amazon people giving me the opportunity to work on this, in particular Pc, Sai <csai@amazon.com> for having patience with me, sharing code and reviewing the project on a regular basis. Also regards to Chandrasekaran, Sabrina <sabricha@amazon.com>, Singh, Veer Yuganter <vysingh@amazon.com> and Cho, Joyce <joycecho@amazon.com>.

#### Anything else that seems useful
Internal project - confidential

 © [Arnout Cator arnout.cator@paconsulting.com]()