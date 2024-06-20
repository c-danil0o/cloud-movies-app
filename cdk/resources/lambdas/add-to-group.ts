import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";

exports.handler = async (event: any) => {
  const { userName, userPoolId } = event;

  try {
    await addUserToGroup({
      userPoolId,
      username: userName,
      groupName: 'User', // <-- Specify the group name you want to assign users to
    });

    console.log("success", event)
    // Return success
    return event;
  } catch (error) {
    console.log("fail", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    };
  }
};

async function addUserToGroup({ userPoolId, username, groupName }: any) {
  const params = {
    GroupName: groupName,
    UserPoolId: userPoolId,
    Username: username,
  };

  const cognitoIdp = new CognitoIdentityProvider();
  await cognitoIdp.adminAddUserToGroup(params);
}
