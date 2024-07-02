import * as cdk from 'aws-cdk-lib'
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import path = require('path');
export class TranscoderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const layer = new cdk.aws_lambda.LayerVersion(this, 'ffpmegLayer', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      code: cdk.aws_lambda.Code.fromAsset(path.join(__dirname, '../resources/layer/', 'ffmpeg.zip')),
      compatibleArchitectures: [cdk.aws_lambda.Architecture.X86_64],
    });



    const nodeJsFunctionProps: NodejsFunctionProps = {
      depsLockFilePath: join(__dirname, '../resources', 'lambdas', 'package-lock.json'),
      environment: {
      },
      runtime: Runtime.PYTHON_3_11,
      layers: [layer]
    }
  }

}

