import * as cdk from 'aws-cdk-lib';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {
  AccountRecovery,
  CfnUserPoolGroup,
  UserPool,
  UserPoolClientIdentityProvider,
  VerificationEmailStyle
} from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, Table, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket, BucketAccessControl, CorsRule, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { DefinitionBody, JsonPath, Map, StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
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

    const ratingsTable = new Table(this, 'Ratings', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    ratingsTable.addGlobalSecondaryIndex({
      indexName: 'UsersIndex',
      partitionKey: { name: 'user', type: AttributeType.STRING },
      sortKey: { name: 'movie_id', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    ratingsTable.addGlobalSecondaryIndex({
      indexName: 'MovieIndex',
      partitionKey: { name: 'movie_id', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    const subscriptionsTable = new Table(this, 'SubscriptionsTable', {
      partitionKey: { name: 'user_id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    const s3CorsRule: CorsRule = {
      allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.POST, HttpMethods.PUT],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
      maxAge: 300,
    };

    const moviesBucket = new Bucket(this, 'Movies-bucket', {
      bucketName: 'movies-cloud-23010023',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
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
        RATINGS_TABLE_NAME: ratingsTable.tableName,
        SUBS_TABLE_NAME: subscriptionsTable.tableName,
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

    const getAllMoviesLambda = new NodejsFunction(this, "GetAllMoviesLambda", {
      entry: 'resources/lambdas/get-all-movies.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const getMovieByIdLambda = new NodejsFunction(this, "GetMovieByIdLambda", {
      entry: 'resources/lambdas/get-movie-by-id.ts',
      handler: 'handler',
      ...nodeJsFunctionProps
    })

    const rateMovieLambda = new NodejsFunction(this, "RateMovieLambda", {
      entry: 'resources/lambdas/rate-movie.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const subscribeLambda = new NodejsFunction(this, "SubscribeLambda", {
      entry: 'resources/lambdas/subscribe.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const getSubscriptionsLambda = new NodejsFunction(this, 'GetSubscriptionsLambda', {
      entry: 'resources/lambdas/get-subscriptions.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })
    const unsubscribeLambda = new NodejsFunction(this, 'UnsubscribeLambda', {
      entry: 'resources/lambdas/unsubscribe.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const transcoderLambda = new NodejsFunction(this, 'transcoderLambda', {
      entry: 'resources/lambdas/transcode.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const updateDbAfterTranscode = new NodejsFunction(this, 'updateDbAfterTranscode', {
      entry: 'resources/lambdas/updateDb.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const transcodeInvoke = new LambdaInvoke(this, "Transcoder", {
      lambdaFunction: transcoderLambda,
      // outputPath: JsonPath.stringAt('$.output')
    });

    const updateDbInvoke = new LambdaInvoke(this, "Update-DB", {
      lambdaFunction: updateDbAfterTranscode,
      // outputPath: JsonPath.stringAt('$.output')
    });

    const transcodeMapStep = new Map(this, "TranscodeMapStep", {
      maxConcurrency: 3,
      itemsPath: JsonPath.stringAt('$.input'),
      resultPath: "$.transcodeOutput"
    });

    transcodeMapStep.itemProcessor(transcodeInvoke);


    const definition = transcodeMapStep.next(updateDbInvoke);

    const stateMachine = new StateMachine(this, "TranscodeStateMachine", {
      definitionBody: DefinitionBody.fromChainable(definition),
      timeout: cdk.Duration.minutes(13),
      comment: "Transcode state machine"
    })





    const startTranscodingLambda = new NodejsFunction(this, 'StartTranscodingLambda', {
      entry: 'resources/lambdas/start.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn
      }
    })
    stateMachine.grantStartExecution(startTranscodingLambda);




    // moviesBucket.grantPut(uploadMovieLambda)

    const queue = new Queue(this, 'S3UploadQueue');
    const sqsEventSource = new SqsEventSource(queue);

    moviesBucket.addEventNotification(EventType.OBJECT_CREATED_PUT, new SqsDestination(queue));

    startTranscodingLambda.addEventSource(sqsEventSource);



    // const notification = new S3EventSource(moviesBucket, {
    //   events: [
    //     EventType.OBJECT_CREATED_PUT
    //   ]
    // });

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

    // updateTableAfterUploadLambda.addEventSource(notification);

    dbTable.grantReadWriteData(downloadMovieLambda);
    dbTable.grantReadWriteData(uploadMovieLambda);
    // dbTable.grantReadWriteData(updateTableAfterUploadLambda);
    dbTable.grantReadWriteData(getAllMoviesLambda);
    dbTable.grantReadWriteData(getMovieByIdLambda);
    ratingsTable.grantReadWriteData(rateMovieLambda);
    subscriptionsTable.grantReadWriteData(subscribeLambda);
    subscriptionsTable.grantReadWriteData(getSubscriptionsLambda);
    subscriptionsTable.grantReadWriteData(unsubscribeLambda);



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
    const getAllMoviesLambdaIntegration = new HttpLambdaIntegration("GetAllMoviesLambdaIntegration", getAllMoviesLambda);
    const getMovieByIdIntegration = new HttpLambdaIntegration("GetMovieByIdIntegration", getMovieByIdLambda);
    const rateMovieIntegration = new HttpLambdaIntegration("RateMovieLambdaIntegration", rateMovieLambda);
    const subscribeIntegration = new HttpLambdaIntegration("SubscribeIntegration", subscribeLambda);
    const getSubscriptionsIntegration = new HttpLambdaIntegration("GetSubscrtiptionsIntegration", getSubscriptionsLambda);
    const unsubscribeIntegration = new HttpLambdaIntegration("UnsubscribeIntegration", unsubscribeLambda);


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
        authorizer: adminAuthorizer,
      }
    );
    api.addRoutes(
      {
        path: '/{proxy+}',
        methods: [HttpMethod.OPTIONS],
        integration: corsOptionsLambdaIntegration,
      }
    );
    api.addRoutes(
      {
        path: '/all',
        methods: [HttpMethod.GET],
        integration: getAllMoviesLambdaIntegration,
      }
    );
    api.addRoutes({
      path: '/movie/{id}',
      methods: [HttpMethod.GET],
      integration: getMovieByIdIntegration,
    })

    api.addRoutes(
      {
        path: '/rate',
        methods: [HttpMethod.POST],
        integration: rateMovieIntegration,
      }
    );
    api.addRoutes(
      {
        path: '/subscribe',
        methods: [HttpMethod.POST],
        integration: subscribeIntegration,
      }
    );
    api.addRoutes(
      {
        path: '/subscriptions/{id}',
        methods: [HttpMethod.GET],
        integration: getSubscriptionsIntegration,
      }
    );
    api.addRoutes(
      {
        path: '/unsubscribe',
        methods: [HttpMethod.POST],
        integration: unsubscribeIntegration,
      }
    );
    new CfnOutput(this, "ApiEndpoint", {
      value: api.apiEndpoint,
    });




  }


}
