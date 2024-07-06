#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PersistenceStack } from "../lib/stacks/persistence-stack";
import { ControllerStack } from "../lib/stacks/controller-stack";
import { MoviesCloudStack } from "../lib/stacks/movies-cloud-stack";
import { AuthStack } from "../lib/stacks/auth-stack";

const app = new cdk.App();

const persistenceStack = new PersistenceStack(app, "PersistenceStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const authStack = new AuthStack(app, "AuthStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const controllerStack = new ControllerStack(app, "ControllerStack", {
  dbTable: persistenceStack.dbTable,
  moviesBucket: persistenceStack.moviesBucket,
  ratingsTable: persistenceStack.ratingsTable,
  subscriptionsTable: persistenceStack.subscriptionsTable,
  feedInfoTable: persistenceStack.feedInfoTable,
  adminAuthorizer: authStack.adminAuthorizer,
  userAuthorizer: authStack.userAuthorizer,
  crewTable: persistenceStack.crewTable,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// const moviesStack = new MoviesCloudStack(app, 'MoviesCloudStack', persistenceStack.moviesBucket, {
//   env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
// });
