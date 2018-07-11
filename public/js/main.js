/*
******** Import Functions ********
*/
import { retrieveLatestPdf } from './teaser-home';
import { initPdfDropzone } from './slideupload';
import { retrievePdf, retrieveAudio, initAudioDropzone, submitListen } from './editpresentation';
import { retrievePdfById, retrieveAudioByPresId, retrievePresentationById } from './viewpresentation';
import { runUserRetrievals } from './userpresentations';

// TODO: combine retrieve functions to single promise.all
/*
******** Onload Function Calls ********
*/
window.onload = function () {
  const pathname = window.location.pathname.split('?')[0];
  console.log(pathname);
  switch (pathname) {
    case '/': 
      retrieveLatestPdf();
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
    case '/user-presentations':
      runUserRetrievals();
      break;
    default:
      break;
  }
};

/*
******** Function Calls ********
*/
Dropzone.autoDiscover = false;

