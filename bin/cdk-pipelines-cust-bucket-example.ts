#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkPipelinesCustBucketExampleStack } from '../lib/cdk-pipelines-cust-bucket-example-stack';

const app = new cdk.App();
new CdkPipelinesCustBucketExampleStack(app, 'CdkPipelinesCustBucketExampleStack');
