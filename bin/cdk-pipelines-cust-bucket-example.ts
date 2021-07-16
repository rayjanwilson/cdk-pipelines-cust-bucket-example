#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelinesStack } from '../lib/pipelines-stack';

const github = {
  owner: "rayjanwilson",
  repo: "cdk-pipelines-cust-bucket-example",
  branch: "master",
};

const app = new cdk.App();
new PipelinesStack(app, 'CdkPipelinesCustBucketExampleStack', {github});
