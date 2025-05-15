const { startServer } = require('./app');
startServer()
  .then(() => {
    console.log('Application started successfully');
  })
  .catch(error => {
    console.error('Application failed to start:', error);
    process.exit(1);
  });