import * as cdk from 'aws-cdk-lib';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import {
  AccountRecovery,
  CfnUserPoolGroup,
  UserPool,
  UserPoolClientIdentityProvider,
  VerificationEmailStyle
} from 'aws-cdk-lib/aws-cognito';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class AuthStack extends cdk.Stack {
  adminAuthorizer: HttpLambdaAuthorizer;
  userAuthorizer: HttpLambdaAuthorizer;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const addUserToGroup = new NodejsFunction(this, "AddUserToGroupLambda", {
      entry: 'resources/lambda/auth/add-to-group.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
    })

    const userPool = new UserPool(this, "UserPool", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lambdaTriggers: {
        postConfirmation: addUserToGroup
      },
      signInAliases: {
        email: true,
      },
      selfSignUpEnabled: true,
      autoVerify: {
        email: true
      },

      userVerification: {
        emailSubject: 'You need to verify your email',
        emailBody: 'Thanks for signing up Your verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      standardAttributes: {
        givenName: {
          required: true,
          mutable: false,
        },
        familyName: {
          required: true,
          mutable: false,
        },
        birthdate: {
          required: true,
          mutable: false,
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: false,
      }
    })

    addUserToGroup.role!.attachInlinePolicy(new Policy(this, 'userpool-policy', {
      statements: [new PolicyStatement({
        actions: ['cognito-idp:AdminAddUserToGroup'],
        resources: [userPool.userPoolArn]
      })]
    }))

    const appIntegrationClient = userPool.addClient("WebClient", {
      userPoolClientName: "MoviesAppClient",
      idTokenValidity: cdk.Duration.days(1),
      accessTokenValidity: cdk.Duration.days(1),
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO]
    });

    new CfnUserPoolGroup(this, "User", {
      groupName: "User",
      userPoolId: userPool.userPoolId
    })

    new CfnUserPoolGroup(this, "Admin", {
      groupName: "Admin",
      userPoolId: userPool.userPoolId
    })

    const adminAuthorizerLambda = new NodejsFunction(this, "AdminAuthorizerLambda", {
      entry: 'resources/lambda/auth/authorizer/admin-auth.ts',
      handler: 'handler',
      depsLockFilePath: join(__dirname, '../../resources/lambda/auth/authorizer/', 'package-lock.json'),
      runtime: Runtime.NODEJS_20_X,
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        CLIENT_ID: appIntegrationClient.userPoolClientId,
      }
    })

    const userAuthorizerLambda = new NodejsFunction(this, "UserAuthorizerLambda", {
      entry: 'resources/lambda/auth/authorizer/user-auth.ts',
      handler: 'handler',
      depsLockFilePath: join(__dirname, '../../resources/lambda/auth/authorizer/', 'package-lock.json'),
      runtime: Runtime.NODEJS_20_X,
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        CLIENT_ID: appIntegrationClient.userPoolClientId,
      }
    })


    this.adminAuthorizer = new HttpLambdaAuthorizer("AdminAuthorizer", adminAuthorizerLambda, {
      responseTypes: [HttpLambdaResponseType.SIMPLE]
    })


    this.userAuthorizer = new HttpLambdaAuthorizer("UserAuthorizer", userAuthorizerLambda, {
      responseTypes: [HttpLambdaResponseType.SIMPLE]
    })
  }






}
