import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { BlockPublicAccess, Bucket, BucketAccessControl, CorsRule, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Transcoder } from '../constructs/transcode-construct';
export class PersistenceStack extends cdk.Stack {
  dbTable: Table;
  moviesBucket: Bucket;
  ratingsTable: Table;
  subscriptionsTable: Table;
  feedInfoTable: Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.dbTable = new Table(this, 'MoviesTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.ratingsTable = new Table(this, 'Ratings', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    this.ratingsTable.addGlobalSecondaryIndex({
      indexName: 'UsersIndex',
      partitionKey: { name: 'user', type: AttributeType.STRING },
      sortKey: { name: 'movie_id', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.ratingsTable.addGlobalSecondaryIndex({
      indexName: 'MovieIndex',
      partitionKey: { name: 'movie_id', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.subscriptionsTable = new Table(this, 'SubscriptionsTable', {
      partitionKey: { name: 'user_id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    this.feedInfoTable = new Table(this, 'FeedInfoTable', {
      partitionKey: { name: 'user_id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const s3CorsRule: CorsRule = {
      allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.POST, HttpMethods.PUT],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
      maxAge: 300,
    };

    this.moviesBucket = new Bucket(this, 'Movies-bucket', {
      bucketName: 'movies-cloud-9990999',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      accessControl: BucketAccessControl.PRIVATE,
      cors: [s3CorsRule]
    });





    const transcoder = new Transcoder(this, "MovieTranscoder", this.moviesBucket, this.dbTable);




  }
}
