/**
 * Dropzone Functions
 */
function initPdfDropzone() {
  $('#slide-dropzone').dropzone({
    url: '/api/pdf',
    maxFilesize: 50, // mb
    uploadMultiple: false,
    addRemoveLinks: true,
    createImageThumbnails: false,
    dictResponseError: 'Server not Configured',
    acceptedFiles: '.pdf',
    headers: {
      'X-CSRF-Token': $('input[name="csrf_token"]').val()
    },
    init() {
      const self = this;
      const date = new Date().getTime();
      const fileInput = document.querySelector('#fileName');
      fileInput.value = '';
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
        console.log('success!', file);
        const fileInput = document.querySelector('#fileName');
        fileInput.value = file.name;
        window.location = '/edit-presentation';
      });
      // On removing file
      self.on('removedfile', (file) => {
        console.log(file);
      });
    },
    accept(file, done) {
      return done();
    }
  });
}

/*
******** Function Exports ********
*/
export { initPdfDropzone };
