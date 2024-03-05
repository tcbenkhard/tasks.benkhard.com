import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_dynamodb, aws_apigateway} from "aws-cdk-lib";
import {AttributeType} from "aws-cdk-lib/aws-dynamodb";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {EndpointType, LambdaIntegration} from "aws-cdk-lib/aws-apigateway";

export class TasksBenkhardComStack extends cdk.Stack {

  private serviceName = 'tasks-benkhard-nl'
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userTable = new aws_dynamodb.Table(this, `UsersTable`, {
      tableName: `${this.serviceName}-users`,
      partitionKey: {
        type: AttributeType.STRING,
        name: 'email'
      }
    })

    const environment = {
      USER_TABLE_NAME: userTable.tableName
    }

    const registrationHandler = new NodejsFunction(this, 'RegistrationHandler', {
      handler: 'handler',
      entry: 'src/registration-handler.ts',
      functionName: `${this.serviceName}-registration`,
      environment,
      memorySize: 512
    })
    userTable.grantReadWriteData(registrationHandler)

    const gateway = new aws_apigateway.RestApi(this, `TasksApi`, {
      restApiName: this.serviceName,
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowHeaders: ['*']
      },
      endpointTypes: [
        EndpointType.REGIONAL
      ]
    });

    const registerResource = gateway.root.addResource('register')
    registerResource.addMethod('POST', new LambdaIntegration(registrationHandler))
  }
}