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
 * GET /audio-upload
 * Audio Upload page.
 */
exports.audio = (req, res) => {
  res.render('audio-upload', {
    title: 'Audio Upload',
    page: 'audio-upload'
  });
};
