/* eslint-disable no-unused-vars */
const Alexa = require('ask-sdk-core');

const axios = require('axios');
const querystring = require('querystring');
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

const postRequest = (requestBody) =>
  axios.post('https://api.amazon.com/auth/o2/token', querystring.stringify(requestBody), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
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
    response = await postRequest(requestBody);
    console.log(`fetchAndStoreAccessTokens --- response is ${response}`);
  } catch (e) {
    console.log(`fetchAndStoreAccessTokens --- error caught is ${e}`);
    return null;
  }
  // eslint-disable-next-line camelcase
  const { access_token, refresh_token, expires_in } = response.data;
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

  const { code } = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLjM4NTk4YTIxLTFhNjgtNGYxMy1iYTk2LTk4OTBlODE2NWE4NCIsImV4cCI6MTYwNDUyNTgzOSwiaWF0IjoxNjA0NTIyMjM5LCJuYmYiOjE2MDQ1MjIyMzksInByaXZhdGVDbGFpbXMiOnsiaXNEZXByZWNhdGVkIjoidHJ1ZSIsIm5vbkx3YVNjb3BlcyI6ImFsZXhhOjpwZXJzb25faWQ6cmVhZCIsImNvbnNlbnRUb2tlbiI6IkF0emF8SXdFQklIa2g2N21FT3c3c1pXUUw3SmloWjNGUXVUWVd2YzFxWVlLUk1vWmRzdGg4TXgzU3RyaW5rY0d3UkNvWXFNRkFOQmlGazVsRUIwWjJMcmpKVXY1aWVLQ3lOVkM4TndmNk1oNEx2N05neG14NXRyY1Y1VXFrRlAtSG5TUURNYzJoUDNnWk9JNjNyY0ppZ0dCdUxwWWgzYlRlN1VNT0xvd1c3Y21jeFZBZmRjSkVOVFN1NWtDM1hqMm1WR2sxdkctWFBLR25VQ2FabkFCN0lsbkpuemZjdHFyeVBnVTJaNHZGUXNnNDBjSFkxeXBoeks2RDJjU1NTdDhKOEVGRGZYM2hPTEM3aWtvdnoyQ1FfQ3draDZ0SWVtNUVkdlhkc3BCTERydk50T1N6SF9wWDBjeEFqWG1SZjlMa3dKX3lqRXNuOGo5anl1dUFSUlQxSnNtaXU1ZzFOOHRDbFFkLXFwcGxxcnRHMkRxSnBaZHJuVW5SQW1NM0lybVNENmhOVlAzQzBMZyIsImRldmljZUlkIjoiYW16bjEuYXNrLmRldmljZS5BSEZTVENIT0MzNk5KRFEzQkpXQjczQTJRTjdCU0FJUTJHNkc0SUE1SUc1Qk1YUFVVVjdWU1RMM1VIRDVGSk5IVzVFWkRXVDY3RkVLSVlYR0k2WEFVNkhHUzZLUzNZV1pQNEY3M1M0QUdOMklURTVZWUhWWjYyVTVVU0w1VktNRENLRjZHWEpBNERUMzI1RE1JVVdEQVVBTlI2TFJRTFJYS0VDRkhTUUZKWEdRVlRZVlFTSDdHIiwidXNlcklkIjoiYW16bjEuYXNrLmFjY291bnQuQUc1TFZUSk9ZM1MyT0FPTTY1NU9MNUFPRDVFNVZWSVZLM0NUVUhHWTZKVktIWkNESk9DM1FBN0dIS0hRUjZMSEs1NVFJMjZYSkhLSkRBNk9MRTY1STNBUEJWNlpGRzZZTUdXNE9HNlZJVjcyWktUTFU0RDZESERaVE9ET1VRRk9BSUJMR0NZVVBGQTJaWVZUTk5VVVBHRjdFRkE0VUc0UVhEWDU3U0lCQ0RaU1hSR0lTUjVXUFhKVkIzVjVHUlcyTEdPQkZFTVBNQTdTRFRJIn19.cdB1u5nkdZK78FDcAXJk1rCHMS_wrIdP8VQvkNvqS6w8o0gdZbDGMZ8854EovplEePkpFLFolwrO5Ajb2qZwSuzKTP3jsC8ooSqCLVIUHH1AgJjRDzXfAw04_fIqZmAO7L-f3SVpjT2jHRL6md93doYZSbSIBng5LJWePj7GqG3AwAC6A1cKznPk_8JGmL-HsufjkQxJvms-SfcoyeSRy3iyV9zgXP8kgqsZF-RirS92SgJ0ZRiX3Ig4xcYEZNzJY1DJccVonyedfxJKBjD5kpJaMzj5hTrAaMG2LY3xm6D9C2aV3ii2NKRxdHODJDsfP_TSeWvnSNyvEwwaXxxeow';
  const userId = Alexa.getUserId(requestEnvelope);
  const requestBody = {
    grant_type: 'authorization_code',
    code,
    // This is the Alexa Client ID you can obtain from the ADC portal
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  return fetchAndStoreAccessTokens(requestBody, userId);
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
