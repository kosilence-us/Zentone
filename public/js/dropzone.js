function retrieveSlide(file) {
  // console.log('---------ajax--------');
  // console.log(file.fileName);
  $.ajax({
    url: 'api/download',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify({
      filename: file.fileName
    }),
    success(res) {
      console.log('successfully retieved slide!');
      console.log(res);
      $('body').html(res);
    },
    error(err) {
      console.log(err);
      $('body').html(err.message);
    }
  });
}

$('#slide-dropzone').dropzone({
  url: '/api/upload',
  maxFilesize: 50, // mb
  uploadMultiple: false,
  addRemoveLinks: true,
  dictResponseError: 'Server not Configured',
  acceptedFiles: '.pdf',
  headers: {
    'X-CSRF-Token': $('input[name="csrf_token"]').val()
  },
  // renameFilename(filename) {
  //
  //   return ;
  // },
  init() {
    console.log('initializing...');
    const self = this;
    const date = new Date().getTime();
    // config
    self.options.addRemoveLinks = true;
    self.options.dictRemoveFile = 'Delete';
    // Error
    self.on('error', (err) => {
      console.log('dropzone upload err ', err);
    });
    // New file added
    self.on('addedfile', (file) => {
      console.log('new file added ', file);
    });
    // Send file starts
    self.on('sending', (file) => {
      file.fileMeta = {
        size: file.size,
        date
      };
      console.log('upload started');
      $('.meter').show();
    });
    // File upload Progress
    self.on('totaluploadprogress', (progress) => {
      console.log('progress ', progress);
      $('.roller').width(`${progress}%`);
    });
    self.on('queuecomplete', (progress) => {
      // $('.meter').delay(999).slideUp(999);
    });
    // File success
    self.on('success', (file, res) => {
      retrieveSlide(res);
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
});
