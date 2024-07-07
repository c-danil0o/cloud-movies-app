import { CognitoJwtVerifier } from "aws-jwt-verify";
export const handler = async (event: any) => {
  const USER_POOL_ID = process.env.USER_POOL_ID || '';
  const CLIENT_ID = process.env.CLIENT_ID || '';
  const verifier = CognitoJwtVerifier.create({
    userPoolId: USER_POOL_ID,
    tokenUse: "id",
    clientId: CLIENT_ID,
    groups: ['Admin', "User"]
  })
  let response = {
    "isAuthorized": false,
  };
  try {
    const payload = await verifier.verify(event.headers.authorization);
    response = {
      isAuthorized: true
    }
    return response;
  } catch {
    return response;
  }



};
