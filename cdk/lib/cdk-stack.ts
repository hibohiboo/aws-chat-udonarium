import * as core from 'aws-cdk-lib';
import * as cf from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { basePath } from '../constants/paths';

interface Props extends core.StackProps {
  bucketName: string;
  distributionId: string;
  domainName: string;
  projectNameTag: string;
  projectId: string;
}

const createPolicy = (bucket: s3.IBucket, identity: cf.OriginAccessIdentity) => {
  const myBucketPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['s3:GetObject', 's3:ListBucket'],
    principals: [
      new iam.CanonicalUserPrincipal(identity.cloudFrontOriginAccessIdentityS3CanonicalUserId),
    ],
    resources: [`${bucket.bucketArn}/*`, bucket.bucketArn],
  });
  return myBucketPolicy;
};
class AWSMobileUdonariumStack extends core.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);
    // CloudFront オリジン用のS3バケットへの参照を取得
    const bucket = s3.Bucket.fromBucketName(this, props.bucketName, props.bucketName);
    // CloudFront で設定する オリジンアクセスアイデンティティ を作成
    const identity = this.createIdentity(
      bucket,
      `${props.projectId}-origin-access-identity-to-s3-bucket`
    );
    // S3バケットポリシーで、CloudFrontのオリジンアクセスアイデンティティを許可
    bucket.addToResourcePolicy(createPolicy(bucket, identity));

    // CloudFrontディストリビューションを作成
    const distribution = cf.Distribution.fromDistributionAttributes(this, props.distributionId, {
      domainName: '',
      distributionId: props.distributionId,
    });
    // 指定したディレクトリをデプロイ
    this.deployS3(bucket, distribution, '../dist', props.bucketName);

    core.Tags.of(this).add('Project', props.projectNameTag);
  }

  private createIdentity(bucket: s3.IBucket, identityName: string) {
    const identity = new cf.OriginAccessIdentity(this, identityName, {
      comment: `${bucket.bucketName} access identity`,
    });
    return identity;
  }

  private deployS3(
    siteBucket: s3.IBucket,
    distribution: cf.IDistribution,
    sourcePath: string,
    bucketName: string
  ) {
    // Deploy site contents to S3 bucket
    // eslint-disable-next-line no-new
    new s3deploy.BucketDeployment(this, `${bucketName}-deploy-with-invalidation`, {
      sources: [s3deploy.Source.asset(sourcePath)],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: [`/${basePath}/*`],
      destinationKeyPrefix: basePath,
    });
  }
}

export default AWSMobileUdonariumStack;
