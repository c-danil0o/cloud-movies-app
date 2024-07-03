import * as cdk from 'aws-cdk-lib';
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { DefinitionBody, JsonPath, Map, StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';

export class Transcoder extends Construct {

  constructor(scope: Construct, id: string, moviesBucket: Bucket) {
    super(scope, id);

    const transcoderLambda = new NodejsFunction(this, 'transcoderLambda', {
      entry: 'resources/lambda/transcode/transcode.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: {}
    })

    const updateDbAfterTranscode = new NodejsFunction(this, 'updateDbAfterTranscode', {
      entry: 'resources/lambda/transcode/updateDb.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: {

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
      entry: 'resources/lambda/transcode/start.ts',
      handler: 'handler',
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn
      }
    })

    stateMachine.grantStartExecution(startTranscodingLambda);


    const queue = new Queue(this, 'S3UploadQueue');
    const sqsEventSource = new SqsEventSource(queue);

    moviesBucket.addEventNotification(EventType.OBJECT_CREATED_PUT, new SqsDestination(queue));

    startTranscodingLambda.addEventSource(sqsEventSource);

  }


}
