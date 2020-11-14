/* eslint-disable no-unused-vars */
const Alexa = require('ask-sdk-core');

const axios = require('axios').default;
const querystring = require('querystring');
const qs = require('qs');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1', // Be sure to update with your AWS region
});

const TABLE_NAME = 'daily-menus'; // Be sure to update with your DynamoDB Table name
const CLIENT_ID = 'amzn1.application-oa2-client.852d0f938fbe4bce91b4e3d665f08358'; // Be sure to update with your CLIENT_ID from ADC portal
const CLIENT_SECRET = 'a49a7a2c533b52f3a7206f9078f193305ebd397ba293d1ea9eb8c4726e63dadf'; // Be sure to update with your CLIENT_SECRET from ADC portal
const docClient = new AWS.DynamoDB.DocumentClient();

function getExpiresAt(expiresIn) {
  const now = new Date().getTime();
  const MILLISECONDS = 1000;
  const expiresAt = new Date(now + expiresIn * MILLISECONDS);

  return expiresAt.toISOString();
}

const url = `https://api.amazon.com/auth/o2/token`;

const postRequest = async (requestBody) =>
  await axios.post({
    url : url,
    method : 'post',
    headers : {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data : requestBody,
    timeout : 1000,
  })
  .then((response) => {
    console.log(response);
  }, (error) => {
    console.log(error);
  });

// Calls DDB to store tokens
const storeCredentials = async (userId, accessToken, refreshToken, expiresIn) => {
  const expiresAt = getExpiresAt(expiresIn);

  const item = {
    UserId: userId,
    AccessToken: accessToken,
    RefreshToken: refreshToken,
    ExpiresAt: expiresAt,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  console.log('Adding a new entry', JSON.stringify(item, null, 2));
  return docClient
    .put(params)
    .promise()
    .then((data) => console.log('Added item:', JSON.stringify(data, null, 2)))
    .catch((err) => console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2)));
};

// Calls LWA to fetch tokens
const fetchAndStoreAccessTokens = async (requestBody, userId) => {
  let response;
  try {
    //time before response
    response = await postRequest(requestBody);
    //time after response
  }
  catch (e) {
    console.log(`fetchAndStoreAccessTokens --- error caught is ${e}`);
    return null;
  }
  // eslint-disable-next-line camelcase
  const { access_token, refresh_token, expires_in } = response.data;
  console.log(`fetchAndStoreAccessTokens --- response data is ${JSON.stringify(response.data)}`);

  await storeCredentials(userId, access_token, refresh_token, expires_in);
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
