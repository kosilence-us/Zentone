$((document).ready(() => {
  console.log('Dropzone initializing...');
  // $('div#slide-upload').dropzone({
  window.Dropzone.options.slideDropzone = {
    maxFilesize: 50, // mb
    uploadMultiple: false,
    addRemoveLinks: true,
    dictResponseError: 'Server not Configured',
    acceptedFiles: '.png,.jpg,.gif,.bmp,.jpeg,.pdf',
    init() {
      const self = this;
      // config
      self.options.addRemoveLinks = true;
      self.options.dictRemoveFile = 'Delete';
      // New file added
      self.on('addedfile', (file) => {
        console.log('new file added ', file);
      });
      // Send file starts
      self.on('sending', (file) => {
        console.log('upload started', file);
        $('.meter').show();
      });

      // File upload Progress
      self.on('totaluploadprogress', (progress) => {
        console.log('progress ', progress);
        $('.roller').width(progress + '%');
      });

      self.on('queuecomplete', (progress) => {
        $('.meter').delay(999).slideUp(999);
      });

      // On removing file
      self.on('removedfile', (file) => {
        console.log(file);
      });
    },
    accept(file, done) {
      console.log('file accepted!');
      return done();
    }
  };
  console.log('Dropzone instance data: ');
  console.log('-----------------------');
  console.log(window.Dropzone.options);
});
