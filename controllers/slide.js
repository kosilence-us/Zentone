/**
 * GET /upload
 * Slide Upload Page
 */
exports.upload = (req, res) => {
  if (req.body) {
    console.log('UPLOAD req:', req.body);
    res.status(200).send(res);
  }
  res.status(400).send('Error occured.');
};
