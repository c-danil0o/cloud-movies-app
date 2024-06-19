import * as cdk from 'aws-cdk-lib';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { CfnAuthorizer, CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AccountRecovery, OAuthScope, UserPool, UserPoolClientIdentityProvider, VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket, BucketAccessControl, CorsRule, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { join } from 'path';

export class MoviesCloudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "UserPool", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
      bucketName: 'movies-cloud-2301002',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.PRIVATE,
      cors: [s3CorsRule]
    });
    const issuer = `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`;

    const adminAuthorizer = new HttpJwtAuthorizer("AdminMoviesAuthorizer", issuer, {
      jwtAudience: ['Admin']
    })

    const userAuthorizer = new HttpJwtAuthorizer("UserMoviesAuthorizer", issuer, {
      jwtAudience: ['User']
    })



    const api = new HttpApi(this, "MoviesApi", {
      apiName: "MoviesApi",
      corsPreflight: {
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.PUT,
          CorsHttpMethod.POST,
        ],
        allowOrigins: ["*"],
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

    const notification = new S3EventSource(moviesBucket, {
      events: [
        EventType.OBJECT_CREATED_PUT
      ]
    });


    updateTableAfterUploadLambda.addEventSource(notification);

    dbTable.grantReadWriteData(downloadMovieLambda);
    dbTable.grantReadWriteData(uploadMovieLambda);
    dbTable.grantReadWriteData(updateTableAfterUploadLambda);

    moviesBucket.grantPutAcl(uploadMovieLambda);
    moviesBucket.grantPut(uploadMovieLambda);

    moviesBucket.grantRead(downloadMovieLambda);

    const downloadLamdaIntegration = new HttpLambdaIntegration("DownloadLambdaIntegration", downloadMovieLambda);
    const uploadLamdaIntegration = new HttpLambdaIntegration("UploadLambdaIntelgration", uploadMovieLambda);

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
    new CfnOutput(this, "ApiEndpoint", {
      value: api.apiEndpoint,
    });




  }


}
