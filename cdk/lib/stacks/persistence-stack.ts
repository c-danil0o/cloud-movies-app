import * as cdk from "aws-cdk-lib";
import { RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  CorsRule,
  EventType,
  HttpMethods,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Transcoder } from "../constructs/transcode-construct";
export class PersistenceStack extends cdk.Stack {
  dbTable: Table;
  moviesBucket: Bucket;
  ratingsTable: Table;
  subscriptionsTable: Table;
  feedInfoTable: Table;
  crewTable: Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.dbTable = new Table(this, "MoviesTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.dbTable.addGlobalSecondaryIndex({
      indexName: "TitleIndex",
      partitionKey: { name: "name", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.dbTable.addGlobalSecondaryIndex({
      indexName: "GenreIndex",
      partitionKey: { name: "genre", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.dbTable.addGlobalSecondaryIndex({
      indexName: "UploadStatusIndex",
      partitionKey: { name: "upload_status", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.ratingsTable = new Table(this, "Ratings", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.ratingsTable.addGlobalSecondaryIndex({
      indexName: "UsersIndex",
      partitionKey: { name: "user", type: AttributeType.STRING },
      sortKey: { name: "movie_id", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.ratingsTable.addGlobalSecondaryIndex({
      indexName: "MovieIndex",
      partitionKey: { name: "movie_id", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.subscriptionsTable = new Table(this, "SubscriptionsTable", {
      partitionKey: { name: "user_id", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.feedInfoTable = new Table(this, "FeedInfoTable", {
      partitionKey: { name: "user_id", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.crewTable = new Table(this, "CrewTable", {
      partitionKey: { name: "user_id", type: AttributeType.STRING },
      sortKey: { name: "movie_id", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.crewTable.addGlobalSecondaryIndex({
      indexName: "MovieIndex",
      partitionKey: { name: "movie_id", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    const s3CorsRule: CorsRule = {
      allowedMethods: [
        HttpMethods.GET,
        HttpMethods.HEAD,
        HttpMethods.POST,
        HttpMethods.PUT,
      ],
      allowedOrigins: ["*"],
      allowedHeaders: ["*"],
      maxAge: 300,
    };

    this.moviesBucket = new Bucket(this, "Movies-bucket", {
      bucketName: "movies-cloud-99900999",
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      accessControl: BucketAccessControl.PRIVATE,
      cors: [s3CorsRule],
    });

    const transcoder = new Transcoder(
      this,
      "MovieTranscoder",
      this.moviesBucket,
      this.dbTable,
    );
  }
}
