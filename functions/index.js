const { onRequest } = require('firebase-functions/v2/https');

exports.sendEmail = onRequest({ cors: true }, async (req, res) => {
  res.status(200).json({ message: 'Hello from Firebase!' });
});