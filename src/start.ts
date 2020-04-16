import ExampleServer from './server';
require('dotenv').config({
  path: "../.env"
})

const exampleServer = new ExampleServer();
exampleServer.start(3000);