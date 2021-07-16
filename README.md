# Cust S3 Bucket for cdk.Pipelines

At current the default policy is set to Retain these buckets which can lead to customers having a number of Orphaned S3 buckets across their accounts.
This can be resolved by creating a custom construct to be used within your pipeline declaration which has a retention policy set to Delete.

The Retain was set up as Default based on customer need, they were having issues with the deletion policies see [here](https://github.com/aws/aws-cdk/pull/1273/files#diff-97a6344bb43117c16441333d96eede412c2c7f7df034f88bbebb90b151eca42dR438)

An example of how to integrate into `cdk.pipelines` is provided

## Notes about the example

- the github token has been stored in Secrets Manager
- any s3 buckets created by this example will now be automatically deleted