import { Construct, PhysicalName, RemovalPolicy, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import { GitHubSourceAction } from "@aws-cdk/aws-codepipeline-actions";
import {
  CdkPipeline,
  ShellScriptAction,
  SimpleSynthAction,
} from "@aws-cdk/pipelines";
import { GenericAppStage } from "./generic-app-stage";
import { BlockPublicAccess, Bucket, BucketEncryption } from "@aws-cdk/aws-s3";

export interface Props extends StackProps {
  github: {
    owner: string;
    repo: string;
    branch: string;
  };
}

export class PipelinesStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const sourceArtifact = new Artifact();
    const cloudAssemblyArtifact = new Artifact();

    const sourceAction = new GitHubSourceAction({
      actionName: "Source",
      oauthToken: SecretValue.secretsManager("github-token"),
      owner: props.github.owner,
      repo: props.github.repo,
      branch: props.github.branch,
      output: sourceArtifact,
    });

    const synthAction = SimpleSynthAction.standardNpmSynth({
      sourceArtifact,
      cloudAssemblyArtifact,
      buildCommand: "npm install && npm run build",
      environmentVariables: {
        branch: { value: props.github.branch },
      },
    });

    // Custom Bucket Solution
    const artifactBucket = new Bucket(this, 'ArtifactsBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      encryption: BucketEncryption.KMS_MANAGED,
      blockPublicAccess: new BlockPublicAccess(BlockPublicAccess.BLOCK_ALL),
      removalPolicy: RemovalPolicy.DESTROY, // <--- when the stack gets destroyed this bucket now gets destroyed
      autoDeleteObjects: true, // <--- stands up a custom lambda resource
    });
    const custom_pipeline = new Pipeline(this, 'BsePipeline', {
      artifactBucket,
      restartExecutionOnUpdate: true,
    });
    // End Solution

    const pipeline = new CdkPipeline(this, "CICD", {
      codePipeline: custom_pipeline, // <--- injecting here
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction,

      // How it will be built and synthesized
      synthAction,
      singlePublisherPerType: true,
    });

    // This is where we add the application stages
    const devStackOptions = { branch: props.github.branch };
    const devApp = new GenericAppStage(this, "Dev", devStackOptions);
    // build and test typescript code
    const devStage = pipeline.addApplicationStage(devApp);
    // these actions can be whatever. they're just dummy actions for this example
    // but it does demo how to do actions in parallel, which is nice
    const current_step_number = devStage.nextSequentialRunOrder();
    devStage.addActions(
      new ShellScriptAction({
        actionName: "CDKUnitTests",
        runOrder: current_step_number,
        additionalArtifacts: [sourceArtifact],
        commands: ["npm install", "npm run build", "npm run test"],
      })
    );
    devStage.addActions(
      new ShellScriptAction({
        actionName: "SecOps",
        runOrder: current_step_number,
        additionalArtifacts: [sourceArtifact],
        commands: ["npm install", "npm run build", "npm run test"],
      })
    );
    
  }
}
