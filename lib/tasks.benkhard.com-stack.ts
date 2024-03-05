import * as cdk from 'aws-cdk-lib';
import {aws_apigateway, aws_dynamodb} from 'aws-cdk-lib';
import {Construct} from 'constructs';
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

    const taskTable = new aws_dynamodb.Table(this, `TasksTable`, {
      tableName: `${this.serviceName}-tasks`,
      partitionKey: {
        type: AttributeType.STRING,
        name: 'parentId'
      },
      sortKey: {
        type: AttributeType.STRING,
        name: 'childId'
      }
    })

    const environment = {
      USER_TABLE_NAME: userTable.tableName,
      TASK_TABLE_NAME: taskTable.tableName
    }

    const registrationHandler = new NodejsFunction(this, 'RegistrationHandler', {
      handler: 'handler',
      entry: 'src/registration-handler.ts',
      functionName: `${this.serviceName}-registration`,
      environment,
      memorySize: 512
    })
    userTable.grantReadWriteData(registrationHandler)

    const loginHandler = new NodejsFunction(this, 'LoginHandler', {
      handler: 'handler',
      entry: 'src/login-handler.ts',
      functionName: `${this.serviceName}-login`,
      environment,
      memorySize: 512
    })
    userTable.grantReadData(loginHandler)

    const createListHandler = new NodejsFunction(this, 'CreateListHandler', {
      handler: 'handler',
      entry: 'src/create-list-handler.ts',
      functionName: `${this.serviceName}-create-list`,
      environment,
      memorySize: 512
    })
    taskTable.grantReadWriteData(createListHandler)

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

    const loginResource = gateway.root.addResource('login')
    loginResource.addMethod('POST', new LambdaIntegration(loginHandler))

    const taskResource = gateway.root.addResource('tasks')
    taskResource.addMethod('POST', new LambdaIntegration(createListHandler))
  }
}
