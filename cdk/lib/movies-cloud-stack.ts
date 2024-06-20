import * as cdk from 'aws-cdk-lib';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { CfnAuthorizer, CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer, HttpLambdaAuthorizer, HttpLambdaResponseType } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AccountRecovery, CfnUserPoolGroup, OAuthScope, UserPool, UserPoolClientIdentityProvider, VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket, BucketAccessControl, CorsRule, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { join } from 'path';

export class MoviesCloudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);




    const dbTable = new Table(this, 'MoviesTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const s3CorsRule: CorsRule = {
      allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.POST],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
      maxAge: 300,
    };

    const moviesBucket = new Bucket(this, 'Movies-bucket', {
      bucketName: 'movies-cloud-23010023',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.PRIVATE,
      cors: [s3CorsRule]
    });


    const api = new HttpApi(this, "MoviesApi", {
      apiName: "MoviesApi",
      corsPreflight: {
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.PUT,
          CorsHttpMethod.POST,
          CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ["http://localhost:4200"],
        allowHeaders: ['Content-Type', "Authorization"],
        allowCredentials: true,
        exposeHeaders: ["*"],
        maxAge: cdk.Duration.days(1)

      },
    });
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      depsLockFilePath: join(__dirname, '../resources', 'lambdas', 'package-lock.json'),
      environment: {
        PRIMARY_KEY: 'itemId',
        TABLE_NAME: dbTable.tableName,
        BUCKET_NAME: moviesBucket.bucketName,
      },
      runtime: Runtime.NODEJS_20_X,
    }
    const downloadMovieLambda = new NodejsFunction(this, 'DownloadLambda', {
      entry: 'resources/lambdas/download.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    });

    const uploadMovieLambda = new NodejsFunction(this, 'UploadLambda', {
      entry: 'resources/lambdas/upload.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    });

    const updateTableAfterUploadLambda = new NodejsFunction(this, "UpdateTableLambda", {
      entry: 'resources/lambdas/updateDb.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })


    const corsOptionsLambda = new NodejsFunction(this, "CorsOptionsLambda", {
      entry: 'resources/lambdas/cors.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const addUserToGroup = new NodejsFunction(this, "AddUserToGroupLambda", {
      entry: 'resources/lambdas/add-to-group.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })



    const notification = new S3EventSource(moviesBucket, {
      events: [
        EventType.OBJECT_CREATED_PUT
      ]
    });

    const userPool = new UserPool(this, "UserPool", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lambdaTriggers: {
        postConfirmation: addUserToGroup
      },
      signInAliases: {
        email: true
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
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: false,
      }
    })
    // userPool.grant(addUserToGroup, 'cognito-idp:AdminAddUserToGroup');
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

    updateTableAfterUploadLambda.addEventSource(notification);

    dbTable.grantReadWriteData(downloadMovieLambda);
    dbTable.grantReadWriteData(uploadMovieLambda);
    dbTable.grantReadWriteData(updateTableAfterUploadLambda);

    moviesBucket.grantPutAcl(uploadMovieLambda);
    moviesBucket.grantPut(uploadMovieLambda);

    moviesBucket.grantRead(downloadMovieLambda);

    const adminAuthorizerLambda = new NodejsFunction(this, "AdminAuthorizerLambda", {
      entry: 'resources/lambdas/admin-auth.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        CLIENT_ID: appIntegrationClient.userPoolClientId,
      }
    })

    const userAuthorizerLambda = new NodejsFunction(this, "UserAuthorizerLambda", {
      entry: 'resources/lambdas/user-auth.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        CLIENT_ID: appIntegrationClient.userPoolClientId,
      }
    })

    const downloadLamdaIntegration = new HttpLambdaIntegration("DownloadLambdaIntegration", downloadMovieLambda);
    const uploadLamdaIntegration = new HttpLambdaIntegration("UploadLambdaIntelgration", uploadMovieLambda);
    const corsOptionsLambdaIntegration = new HttpLambdaIntegration("CorsOptionsLambdaIntegration", corsOptionsLambda);


    const adminAuthorizer = new HttpLambdaAuthorizer("AdminAuthorizer", adminAuthorizerLambda, {
      responseTypes: [HttpLambdaResponseType.SIMPLE]
    })


    const userAuthorizer = new HttpLambdaAuthorizer("UserAuthorizer", userAuthorizerLambda, {
      responseTypes: [HttpLambdaResponseType.SIMPLE]
    })


    api.addRoutes(
      {
        path: '/download/{id}',
        methods: [HttpMethod.GET],
        integration: downloadLamdaIntegration,
        authorizer: adminAuthorizer,
      });
    api.addRoutes(
      {
        path: '/upload',
        methods: [HttpMethod.POST],
        integration: uploadLamdaIntegration,
        authorizer: userAuthorizer,
      }
    );
    api.addRoutes(
      {
        path: '/{proxy+}',
        methods: [HttpMethod.OPTIONS],
        integration: corsOptionsLambdaIntegration,
      }
    );
    new CfnOutput(this, "ApiEndpoint", {
      value: api.apiEndpoint,
    });




  }


}
