import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface ControllerProps extends cdk.StackProps {
  dbTable: Table,
  moviesBucket: Bucket,
  subscriptionsTable: Table,
  ratingsTable: Table,
  feedInfoTable: Table,
  adminAuthorizer: HttpLambdaAuthorizer,
  userAuthorizer: HttpLambdaAuthorizer

}

export class ControllerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ControllerProps) {
    super(scope, id, props);

    const dbTable = props?.dbTable;
    const moviesBucket = props?.moviesBucket;
    const ratingsTable = props?.ratingsTable;
    const subscriptionsTable = props?.subscriptionsTable;
    const feedInfoTable = props?.feedInfoTable;
    const adminAuthorizer = props?.adminAuthorizer;
    const userAuthorizer = props?.userAuthorizer;

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
      // bundling: {
      //   externalModules: [
      //     'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
      //   ],
      // },
      // depsLockFilePath: join(__dirname, '../resources', 'lambdas', 'package-lock.json'),
      environment: {
        PRIMARY_KEY: 'itemId',
        TABLE_NAME: dbTable.tableName,
        RATINGS_TABLE_NAME: ratingsTable.tableName,
        SUBS_TABLE_NAME: subscriptionsTable.tableName,
        FEED_TABLE_NAME: feedInfoTable.tableName,
        BUCKET_NAME: moviesBucket.bucketName,
      },
      runtime: Runtime.NODEJS_20_X,
    }
    const downloadMovieLambda = new NodejsFunction(this, 'DownloadLambda', {
      entry: 'resources/lambda/movie/download.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    });

    const uploadMovieLambda = new NodejsFunction(this, 'UploadLambda', {
      entry: 'resources/lambda/movie/upload.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    });


    const corsOptionsLambda = new NodejsFunction(this, "CorsOptionsLambda", {
      entry: 'resources/lambda/auth/cors.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const getAllMoviesLambda = new NodejsFunction(this, "GetAllMoviesLambda", {
      entry: 'resources/lambda/movie/get-all-movies.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })

    const getMovieByIdLambda = new NodejsFunction(this, "GetMovieByIdLambda", {
      entry: 'resources/lambda/movie/get-movie-by-id.ts',
      handler: 'handler',
      ...nodeJsFunctionProps
    })

    const rateMovieLambda = new NodejsFunction(this, "RateMovieLambda", {
      entry: 'resources/lambda/movie/rate-movie.ts',
      handler: 'handler',
      bundling: {
        nodeModules: [], // Example of local module path
      },
      ...nodeJsFunctionProps,
    })

    const subscribeLambda = new NodejsFunction(this, "SubscribeLambda", {
      entry: 'resources/lambda/movie/subscribe.ts',
      handler: 'handler',
      bundling: {
        nodeModules: [], // Example of local module path
      },
      ...nodeJsFunctionProps,
    })

    const getSubscriptionsLambda = new NodejsFunction(this, 'GetSubscriptionsLambda', {
      entry: 'resources/lambda/movie/get-subscriptions.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })
    const unsubscribeLambda = new NodejsFunction(this, 'UnsubscribeLambda', {
      entry: 'resources/lambda/movie/unsubscribe.ts',
      handler: 'handler',
      bundling: {
        nodeModules: [], // Example of local module path
      },
      ...nodeJsFunctionProps,
    })
    const getPersonalizedFeedLambda = new NodejsFunction(this, 'GetPersonalizedFeedLambda', {
      entry: 'resources/lambda/movie/get-personalized-feed.ts',
      handler: 'handler',
      ...nodeJsFunctionProps,
    })


    dbTable.grantReadWriteData(downloadMovieLambda);
    dbTable.grantReadWriteData(uploadMovieLambda);
    dbTable.grantReadWriteData(getAllMoviesLambda);
    dbTable.grantReadWriteData(getMovieByIdLambda);
    dbTable.grantReadWriteData(getPersonalizedFeedLambda);

    ratingsTable.grantReadWriteData(rateMovieLambda);

    subscriptionsTable.grantReadWriteData(subscribeLambda);
    subscriptionsTable.grantReadWriteData(getSubscriptionsLambda);
    subscriptionsTable.grantReadWriteData(unsubscribeLambda);

    feedInfoTable.grantReadWriteData(rateMovieLambda);
    feedInfoTable.grantReadWriteData(subscribeLambda);
    feedInfoTable.grantReadWriteData(unsubscribeLambda);
    feedInfoTable.grantReadWriteData(downloadMovieLambda);
    feedInfoTable.grantReadWriteData(getPersonalizedFeedLambda);
    


    moviesBucket.grantPutAcl(uploadMovieLambda);
    moviesBucket.grantPut(uploadMovieLambda);
    moviesBucket.grantRead(downloadMovieLambda);



    const downloadLamdaIntegration = new HttpLambdaIntegration("DownloadLambdaIntegration", downloadMovieLambda);
    const uploadLamdaIntegration = new HttpLambdaIntegration("UploadLambdaIntelgration", uploadMovieLambda);
    const corsOptionsLambdaIntegration = new HttpLambdaIntegration("CorsOptionsLambdaIntegration", corsOptionsLambda);
    const getAllMoviesLambdaIntegration = new HttpLambdaIntegration("GetAllMoviesLambdaIntegration", getAllMoviesLambda);
    const getMovieByIdIntegration = new HttpLambdaIntegration("GetMovieByIdIntegration", getMovieByIdLambda);
    const rateMovieIntegration = new HttpLambdaIntegration("RateMovieLambdaIntegration", rateMovieLambda);
    const subscribeIntegration = new HttpLambdaIntegration("SubscribeIntegration", subscribeLambda);
    const getSubscriptionsIntegration = new HttpLambdaIntegration("GetSubscrtiptionsIntegration", getSubscriptionsLambda);
    const unsubscribeIntegration = new HttpLambdaIntegration("UnsubscribeIntegration", unsubscribeLambda);
    const getPersonalizedFeedIntegration = new HttpLambdaIntegration("GetPersonalizedFeedIntgration", getPersonalizedFeedLambda);


    api.addRoutes(
      {
        path: '/download/{id}',
        methods: [HttpMethod.POST],
        integration: downloadLamdaIntegration,
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
    api.addRoutes(
        {
          path: '/feed/{user_id}',
          methods: [HttpMethod.GET],
          integration: getPersonalizedFeedIntegration,
        }
    );
    new CfnOutput(this, "ApiEndpoint", {
      value: api.apiEndpoint,
    });
  }
}