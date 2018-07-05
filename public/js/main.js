/*
******** Import Functions ********
*/
import { retrieveLatestPdf } from './teaser-home';
import { initPdfDropzone } from './slideupload';
import { retrievePdf, retrieveAudio, initAudioDropzone, submitListen } from './editpresentation';
import { retrievePdfById, retrieveAudioByPresId, retrievePresentationById } from './viewpresentation';

/*
******** Onload Function Calls ********
*/
window.onload = function () {
  const pathname = window.location.pathname.split('?')[0];
  console.log(pathname);
  switch (pathname) {
    case '/': 
      break;
    case '/teaser-home':
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
    case '/view-presentation/':
      retrievePdfById();
      retrieveAudioByPresId();
      retrievePresentationById();
      break;
    default:
      break;
  }
};

/*
******** Function Calls ********
*/
Dropzone.autoDiscover = false;

