import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { GenericAppStack } from './generic-app';

export interface Props extends StageProps {
  branch: string;
}

export class GenericAppStage extends Stage {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    new GenericAppStack(this, `ExampleGenericApp-${props.branch}`, {
      tags: {
        Application: 'GenericApp',
        Environment: id,
        Branch: props.branch,
      },
    });
  }
}