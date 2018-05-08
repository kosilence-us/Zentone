import { retrievePdf, retrieveMp3 } from './ajax';

const domain = window.location.hostname;
const url = window.location.href;

/**
 * Define Dropzone Functions
 */
function initPdfDropzone() {
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
        retrievePdf(res);
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

function initAudioDropzone() {
  $('#audio-dropzone').dropzone({
    url: '/api/audio-upload',
    maxFilesize: 50, // mb
    uploadMultiple: false,
    addRemoveLinks: true,
    dictResponseError: 'Server not Configured',
    acceptedFiles: '.mp3',
    headers: {
      'X-CSRF-Token': $('input[name="csrf_token"]').val()
    },
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
        retrieveMp3(res);
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

function dzNameChange() {
  const audioDropzoneStyle = $('.audio-dropzone');

  const onDragEnter = (event) => {
    audioDropzoneStyle.addClass('dragover');
  };

  const onDragOver = (event) => {
    event.preventDefault();
    if (!audioDropzoneStyle.hasClass('dragover'))
      audioDropzoneStyle.addClass('dragover');
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    audioDropzoneStyle.removeClass('dragover');
  };

  const onDrop = (event) => {
    audioDropzoneStyle.removeClass('dragover');
    audioDropzoneStyle.addClass('dragdrop');
    console.log(event.originalEvent.dataTransfer.files);
  };

  audioDropzoneStyle
    .on('dragenter', onDragEnter)
    .on('dragover', onDragOver)
    .on('dragleave', onDragLeave)
    .on('drop', onDrop);
}

/**
 * Call Dropzones According to URL
 */
switch (url) {
  case `http://${domain}:3000/slide-upload`:
    console.log('--------pdf dz--------');
    console.log(url);
    console.log(domain);
    initPdfDropzone();
    break;
  case `http://${domain}:3000/edit-presentation`:
    console.log('--------audio dz--------');
    console.log(url);
    console.log(domain);
    initAudioDropzone();
    dzNameChange();
    break;
  default:
    console.log('--------default dz--------');
    console.log(url);
    console.log(domain);
    break;
}
