/**
 * GET /slide-upload
 * Slide Upload page.
 */
exports.slide = (req, res) => {
  res.render('slide-upload', {
    title: 'Slide Upload',
    page: 'slide-upload'
  });
};
