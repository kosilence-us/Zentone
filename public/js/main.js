/*
******** Import Functions ********
*/
import { pdfViewer } from './home';
import { initPdfDropzone } from './slideupload';
import { retrievePdf, retrieveAudio, initAudioDropzone, } from './editpresentation';

/*
******** Onload Function Calls ********
*/
window.onload = function () {
  switch (window.location.pathname) {
    case '/':
      pdfViewer();
      break;
    case '/slide-upload':
      initPdfDropzone();
      break;
    case '/edit-presentation':
      retrievePdf();
      retrieveAudio();
      initAudioDropzone();
      break;
    default:
      break;
  }
};

/*
******** Function Calls ********
*/
Dropzone.autoDiscover = false;

