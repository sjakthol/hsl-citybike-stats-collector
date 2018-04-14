AWS Lambda function for collecting availability statistics of HSL Citybikes.

# What?
This project collects citybike availability statistics from the Helsinki Regional
Transport (HSL / HRT) APIs and writes them to DynamoDB. CloudWatch events invokes
the Lambda function once every five minutes.

# Deployment
To make a deployment, do the following:

* Setup build-resources bucket as defined in my [aws-account-infra](https://github.com/sjakthol/aws-account-infra/blob/master/templates/infra-buckets.yaml)
* Run the following:
```
make deploy
```

The deploy target will build, upload and deploy the Lambda function and related
resources with CloudFormation.
