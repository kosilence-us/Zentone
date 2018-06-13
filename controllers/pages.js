/**
 * GET /slide-upload
 * Slide Upload page.
 */
exports.slide = (req, res) => {
  if (!req.user) {
    req.flash('info', { msg: 'Create an account first!' });
    return res.redirect('/signup');
  }
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
  if (!req.user) {
    return res.redirect('/signup');
  }
  res.render('edit-presentation', {
    title: 'Edit Presentation',
    page: 'edit-presentation'
  });
};
