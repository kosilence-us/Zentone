/**
 * GET /upload
 * Slide Upload Page
 */
exports.upload = (req, res) => {
  res.render('upload', {
    title: 'New Slide'
  });
};