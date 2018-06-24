/*
******** Import Functions ********
*/
import { retrieveLatestPdf } from './home';
import { initPdfDropzone } from './slideupload';
import { retrievePdf, retrieveAudio, initAudioDropzone, submitListen } from './editpresentation';

/*
******** Onload Function Calls ********
*/
window.onload = function () {
  switch (window.location.pathname) {
    case '/':
      retrieveLatestPdf();
      break;
    case '/slide-upload':
      initPdfDropzone();
      break;
    case '/edit-presentation':
      retrievePdf();
      retrieveAudio();
      initAudioDropzone();
      submitListen();
      break;
    default:
      break;
  }
};

/*
******** Function Calls ********
*/
Dropzone.autoDiscover = false;

