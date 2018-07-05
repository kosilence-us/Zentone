/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('teaser-home', {
    title: 'Home',
    page: 'home'
  });
};
