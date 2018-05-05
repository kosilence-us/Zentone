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
/**
 * GET /edit-presentation
 * Presentation Upload page.
 */
exports.presentation = (req, res) => {
  res.render('edit-presentation', {
    title: 'Edit Presentation',
    page: 'edit-presentation'
  });
};
