/* eslint-disable no-unused-vars */
const Alexa = require('ask-sdk-core');

const axios = require('axios').default;
const qs = require('qs');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1', // Be sure to update with your AWS region
});

const TABLE_NAME = 'daily-menus'; // Be sure to update with your DynamoDB Table name
const CLIENT_ID = 'amzn1.application-oa2-client.8997938a33a3410c921a3cb638c55fc8'; // Be sure to update with your CLIENT_ID from Alexa Skill Account Linking
const CLIENT_SECRET = '5352c993e908f7b9fe431e61c12534d18dbe9dd59374886645311181bce74c8b'; // Be sure to update with your CLIENT_SECRET from Alexa Skill Account Linking
const docClient = new AWS.DynamoDB.DocumentClient();
const url = `https://api.amazon.com/auth/o2/token`;
let lastUseTimestamp;

function getExpiresAt(expiresIn) {
  const now = new Date().getTime();
  const MILLISECONDS = 1000;
  const expiresAt = new Date(now + expiresIn * MILLISECONDS);

  return expiresAt.toISOString();
}

const postRequest = async (requestBody) =>
  await axios({
    url,
    method : 'post',
    headers : {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data : qs.stringify(requestBody),
    timeout : 1000,
  })
  .then((response) => {
    return response;
  }, (error) => {
    console.log(error);
  });

// Calls DDB to store tokens
const storeCredentials = async (userId, accessToken, refreshToken, expiresIn, lastUseTimestamp) => {
  const expiresAt = getExpiresAt(expiresIn);

  const item = {
    id: userId,
    AccessToken: accessToken,
    RefreshToken: refreshToken,
    ExpiresAt: expiresAt,
    lastUseTimestamp
  };

  const params = {
    TableName: TABLE_NAME,
    Key:{ "id": userId },
    Item: item,
  };

  //add also to an initial session, if there is no existing session for the user
  if(getUserId() === userId ){
    console.log('Updating an existing entry', JSON.stringify(item, null, 2));
    return docClient
    .update(params)
    .promise()
    .then((data) => console.log('Updated item:', JSON.stringify(data, null, 2)))
    .catch((err) => console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2)));
  } else {
    console.log('Adding a new entry', JSON.stringify(item, null, 2));
    return docClient
    .update(params)
    .promise()
    .then((data) => console.log('Added item:', JSON.stringify(data, null, 2)))
    .catch((err) => console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2)));
  }
 
};

// Get user id from Dynamodb
const getUserId = async (userId) => {
  try{
    const params = {
      TableName:  TABLE_NAME,
      Key:{ "id": userId },
    };

    const result =  docClient.get(params).promise();
    console.log(`getUserId -- result is ${JSON.stringify(result)}`);
  } catch(err) {
      console.log(`The user ID does not exit ${err}`);
  }
}

// Calls LWA to fetch tokens
const fetchAndStoreAccessTokens = async (requestBody, userId) => {
  let response;
  try {
    response = await postRequest(requestBody);
  }
  catch (e) {
    console.log(`fetchAndStoreAccessTokens --- error caught is ${e}`);
    return null;
  }
  // eslint-disable-next-line camelcase
  const { access_token, refresh_token, expires_in } = response.data;
  console.log(`fetchAndStoreAccessTokens --- response data is ${JSON.stringify(response.data)}`);
  
  //check for existing Item in session
  getUserId(userId);

  await storeCredentials(userId, access_token, refresh_token, expires_in, lastUseTimestamp);
  return response.data;
};

const refreshAccessToken = async (userId, refreshToken) => {
  const requestBody = {
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
  };
  return fetchAndStoreAccessTokens(requestBody, userId);
};

const handle = async (requestEnvelope) => {
  // The requestEnvelope holds a request object of the form:
  // {
  //   type: 'Alexa.Authorization.Grant',
  //   requestId: '5b1f1bf4-e559-42fb-8c79-8f2facc51f84',
  //   timestamp: '2020-10-29T23:21:59Z',
  //   body: {
  //     grant: { type: 'OAuth2.AuthorizationCode', code: 'RHjSfTTjGYHNkWaxSiez' }
  //   }
  // }
  console.log(`AuthTokenHandler --- handle() -- requestEnvelope is ${JSON.stringify(requestEnvelope.request)}`);

  //update global variable to use for DynamoDB
  lastUseTimestamp = new Date(requestEnvelope.request.timestamp).getTime();

  const { code } = requestEnvelope.request.body.grant;
  console.log(`AuthTokenHandler --- handle() -- code is ${JSON.stringify(code)}`);

  const userId = Alexa.getUserId(requestEnvelope);
  console.log(`AuthTokenHandler --- handle() -- userId is ${JSON.stringify(userId)}`);

  const requestBody = {
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT_ID,
    client_secret : CLIENT_SECRET,
  };

  console.log(`AuthTokenHandler --- handle() -- qs.stringify requestBody is ${qs.stringify(requestBody)}`);


  return await fetchAndStoreAccessTokens(requestBody, userId);
};

// Returns a token value that is a string or null
// Calls DynamoDB to fetch the tokens:
//   If tokens are present and they haven't expired, returns token
//   If tokens are present and they HAVE expired, refreshes and returns token
//   If tokens are not present, returns null, user to handle no permission scenario
const getToken = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id: userId },
  };

  let token;

  try {
    console.log(`getToken --- params are ${JSON.stringify(params)}`);
    const item = await docClient.get(params).promise();
    console.log('Retrieved item:', JSON.stringify(item.Item, null, 2));
    token = item.Item.AccessToken;
    const { RefreshToken, ExpiresAt } = item.Item;
    if (getExpiresAt(60) >= ExpiresAt) {
      // We need to refresh the tokens now, store the new ones, and then return the newly stored tokens
      // since the access token is close to expiry or has expired already
      console.log(`Need to refresh tokens!`);
      const response = await refreshAccessToken(userId, RefreshToken);
      console.log(`Refreshed tokens ${JSON.stringify(response, null, 2)}`);
      return getToken(userId);
    }
  } catch (err) {
    console.error('Unable to find item. Error JSON:', JSON.stringify(err, null, 2));
    // If we cannot find the item, it means user did not grant permissions. Handle error appropriately
    console.log(`User has not granted permissions to resume`);
  }

  console.log(`Return token: ${token}`);
  return token;
};

module.exports = {
  handle,
  getToken,
};
