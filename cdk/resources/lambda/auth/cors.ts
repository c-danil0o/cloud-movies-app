import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

async function handler(event: APIGatewayProxyEvent, context: Context) {
  const response: APIGatewayProxyResult = {
    statusCode: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:4200",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE,PATCH",
      "Access-Control-Allow-Headers": "Content-Type,Authorization"
    },
    body: ""
  };

  return response;
}

export { handler };
