import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import { Code, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { HttpApi } from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import { RetentionDays } from '@aws-cdk/aws-logs'


export class GenericAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const myLambda = new NodejsFunction(this, 'Lambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/lambda/generic-lambda.js`,
      handler: 'handler',
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
      bundling: {
        minify: true,
      },
    });

    const api = new HttpApi(this, 'Endpoint', {
      defaultIntegration: new LambdaProxyIntegration({
        handler: myLambda,
      }),
    });

    new CfnOutput(this, 'HTTP API Url', {
      value: api.url ?? 'Something went wrong with the deploy',
    });
  }
}