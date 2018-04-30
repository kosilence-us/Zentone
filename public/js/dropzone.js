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
  renameFile(filename) {
    const date = new Date().getTime();
    return `${date} ${filename}`;
  },
  init() {
    console.log('initializing...');
    console.log(this);
    const self = this;
    // config
    self.options.addRemoveLinks = true;
    self.options.dictRemoveFile = 'Delete';
    // Error
    self.on('error', (err) => {
      console.log('dropzone upload err ', err);
    });
    // New file added
    this.on('addedfile', (file) => {
      console.log('new file added ', file);
    });
    // Send file starts
    self.on('sending', (file) => {
      file.fileMeta = {
        fileName: file.name,
        size: file.size,
        date: new Date().getTime()
      };
      console.log('upload started', file);
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
      console.log('success!');
      console.log(file);
      console.log(res);
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
