/**
 * GET /slide-upload
 * Slide Upload page.
 */
exports.slide = (req, res) => {
  if (!req.user) {
    req.flash('info', { msg: 'Create an account first!' });
    return res.redirect('/signup');
  }
  const tempSession = req.session;
  // Regenerate req.session to get a new presentation ID
  req.session.regenerate((err) => {
    console.log('--> Regenerating new session...');
    Object.assign(req.session, tempSession);
    if (err) {
      return res.send('Could not regenerate session');
    }
    res.render('slide-upload', {
      title: 'Slide Upload',
      page: 'slide-upload'
    });
  });
};

/**
 * GET /edit-presentation
 * Presentation Upload page.
 */
exports.editPresentation = (req, res) => {
  if (!req.user) {
    return res.redirect('/signup');
  }
  res.render('edit-presentation', {
    title: 'Edit Presentation',
    page: 'edit-presentation'
  });
};

/**
 * GET /view-presentation
 * Get Presentation View page.
 */
exports.viewPresentation = (req, res) => {
  res.render('view-presentation', {
    title: 'View Presentation',
    page: '/view-presentation/:id'
  });
};

