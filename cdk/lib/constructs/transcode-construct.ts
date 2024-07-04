import * as cdk from 'aws-cdk-lib';
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { DefinitionBody, JitterType, JsonPath, Map, StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import path = require('path');
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export class Transcoder extends Construct {

  constructor(scope: Construct, id: string, moviesBucket: Bucket, moviesTable: Table) {
    super(scope, id);

    const layer = new cdk.aws_lambda.LayerVersion(this, 'ffpmegLayer', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      code: cdk.aws_lambda.Code.fromAsset(path.join(__dirname, '../../resources/layer/transcode/', 'ffmpeg.zip')),
      compatibleArchitectures: [cdk.aws_lambda.Architecture.X86_64],
    });

    const transcoderLambda = new NodejsFunction(this, 'transcoderLambda', {
      entry: 'resources/lambda/transcode/transcode.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: {
        BUCKET_NAME: moviesBucket.bucketName
      },
      layers: [layer],
      timeout: cdk.Duration.seconds(900)

    })

    const updateDbAfterTranscode = new NodejsFunction(this, 'updateDbAfterTranscode', {
      entry: 'resources/lambda/transcode/updateDb.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: {
        TABLE_NAME: moviesTable.tableName

      }
    })
    const updateDbAfterTranscodeFail = new NodejsFunction(this, 'updateDbAfterTranscodeFail', {
      entry: 'resources/lambda/transcode/updateDb-fail.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: {
        TABLE_NAME: moviesTable.tableName

      }
    })

    const transcodeInvoke = new LambdaInvoke(this, "Transcoder", {
      lambdaFunction: transcoderLambda,
      // outputPath: JsonPath.stringAt('$.output')
    });

    const updateDbInvoke = new LambdaInvoke(this, "Update-DB", {
      lambdaFunction: updateDbAfterTranscode,
      // outputPath: JsonPath.stringAt('$.output')
    });

    const updateDbInvokeFail = new LambdaInvoke(this, "Update-DB-Fail", {
      lambdaFunction: updateDbAfterTranscodeFail,
      // outputPath: JsonPath.stringAt('$.output')
    });
    const transcodeMapStep = new Map(this, "TranscodeMapStep", {
      maxConcurrency: 3,
      itemsPath: JsonPath.stringAt('$.input'),
      resultPath: "$.transcodeOutput"
    });



    transcodeMapStep.itemProcessor(transcodeInvoke);
    transcodeInvoke.addRetry({
      maxAttempts: 1,
      maxDelay: cdk.Duration.minutes(3),
      jitterStrategy: JitterType.FULL
    })

    transcodeMapStep.addCatch(updateDbInvokeFail);



    const definition = transcodeMapStep.next(updateDbInvoke);

    const stateMachine = new StateMachine(this, "TranscodeStateMachine", {
      definitionBody: DefinitionBody.fromChainable(definition),
      timeout: cdk.Duration.minutes(15),
      comment: "Transcode state machine"
    })


    const startTranscodingLambda = new NodejsFunction(this, 'StartTranscodingLambda', {
      entry: 'resources/lambda/transcode/start.ts',
      handler: 'handler',
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn,
        BUCKET_NAME: moviesBucket.bucketName,
      }
    })

    stateMachine.grantStartExecution(startTranscodingLambda);
    moviesBucket.grantRead(startTranscodingLambda);
    moviesBucket.grantReadWrite(transcoderLambda);
    moviesTable.grantWriteData(updateDbAfterTranscode);
    moviesTable.grantWriteData(updateDbAfterTranscodeFail);



    const queue = new Queue(this, 'S3UploadQueue');
    const sqsEventSource = new SqsEventSource(queue);

    moviesBucket.addEventNotification(EventType.OBJECT_CREATED_PUT, new SqsDestination(queue));

    startTranscodingLambda.addEventSource(sqsEventSource);

  }


}
