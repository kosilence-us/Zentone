$(document).ready(() => {
  $(() => {
    Dropzone.options.myAwesomeDropzone = {
      paramName: 'file',
      maxFilesize: 50,
      addRemoveLinks: true,
      dictResponseError: 'Server not Configured',
      acceptedFiles: '.pdf',
      init: () => {
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
      }
    };
  });
});
