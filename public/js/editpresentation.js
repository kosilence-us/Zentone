/**
 * Globals
 */
let audioArr = [];
let pageNum = 1;
let pageRendering = false;

/*
 ******** Audio Dropzone ********
 */
function addIncompleteDz() {
  const audioDropzone = document.querySelector('.audio-dropzone');
  const message = document.querySelector('.dz-message');
  const remove = document.querySelectorAll('.remove');
  if (remove) {
    remove.forEach(remove => remove.remove());
  }
  message.textContent = 'Add audio to this slide!';
  audioDropzone.classList.remove('success');
  audioDropzone.classList.add('incomplete');
  audioDropzone.classList.add('dz-clickable');
}

async function deleteAudio() {
  const fileInput = document.querySelector('#fileName');
  const remove = document.querySelector('.remove');
  const audio = audioArr.filter(audio => audio.pageNum === pageNum);
  addIncompleteDz();
  remove.remove();
  fileInput.value = '';
  try {
    const res = await fetch(`/api/audio/${audio[0].id}`, {
      credentials: 'include',
      method: 'DELETE'
    });
    const deleted = await res.json();
    if (deleted === 0) {
      return new Error('Audio not deleted');
    }
    console.log('Deleted ', audio[0].id);
  } catch (err) {
    console.error(err);
  }
}

function addSuccessControls() {
  const slideControls = document.querySelectorAll('.slide-controls');
  slideControls.forEach((control) => {
    control.classList.remove('incomplete');
    control.classList.add('success');
  });
}

function addIncompleteControls() {
  const slideControls = document.querySelectorAll('.slide-controls');
  slideControls.forEach((control) => {
    control.classList.remove('success');
    control.classList.add('incomplete');
  });
}

function addSuccessDz() {
  const audioDropzone = document.querySelector('.audio-dropzone');
  const audioContainer = document.querySelector('.audio-container');
  const message = document.querySelector('.dz-message');
  const remove = document.createElement('a');
  remove.classList.add('remove');
  remove.textContent = 'Remove';
  remove.dataset.dzRemove = 'dz-remove';
  remove.addEventListener('click', deleteAudio);
  message.textContent = '';
  audioContainer.appendChild(remove);
  audioDropzone.classList.remove('dz-clickable');
  audioDropzone.classList.remove('incomplete');
  audioDropzone.classList.add('success');
}

function buildAudioDz() {
  const fileInput = document.querySelector('#fileName');
  const pageAudio = audioArr.filter(audio => audio.pageNum === pageNum);
  console.info('Populating Select Box...');
  if (pageAudio.length !== 0) {
    fileInput.value = pageAudio[0].originalFileName;
    addSuccessDz();
    addSuccessControls();
  } else {
    fileInput.value = 'no audio';
    addIncompleteDz();
    addIncompleteControls();
  }
}
// TODO: migrate from jQuery
function initAudioDropzone() {
  $('#audio-dropzone').dropzone({
    url: '/api/audio',
    maxFilesize: 50, // mb
    addRemoveLinks: null,
    createImageThumbnails: false,
    acceptedFiles: 'audio/*',
    headers: {
      'X-CSRF-Token': $('input[name="csrf_token"]').val()
    },
    init() {
      const self = this;
      self.options.addRemoveLinks = true;
      self.options.dictRemoveFile = 'Delete';
      self.on('error', (err) => {
        console.error('Upload Error: ', err.xhr.responseText);
      });
      self.on('addedfile', (file) => {
        console.log('new file added ', file);
      });
      self.on('sending', (file, xhr, fileData) => {
        file.pageNum = pageNum;
        fileData.append('pageNum', pageNum);
        fileData.append('size', file.size);
        $('.meter').show();
      });
      self.on('totaluploadprogress', (progress) => {
        console.log('progress ', progress);
        $('.roller').width(`${progress}%`);
      });
      self.on('queuecomplete', () => {
        // $('.meter').delay(999).slideUp(999);
      });
      self.on('success', (file, res) => {
        audioArr.push(res);
        buildAudioDz();
      });
      self.on('removedfile', (file) => {
        audioArr = audioArr.filter(audio => audio.pageNum !== pageNum);
        console.log(audioArr);
      });
    },
    accept(file, done) {
      return done();
    }
  });
}

/*
******** Presentation Viewport ********
*/
// TODO: fix viewport scaling issue
async function pdfEditor(pdf) {
  if (!pdf) {
    return console.log('Could not retrieve PDF from current session');
  }
  console.log('pdf loading data...', pdf.fileUrl);
  const url = pdf.fileUrl;
  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.
  // Loaded via <script> tag, create shortcut to access PDF.js exports.
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  // The workerSrc property shall be specified.
  // TODO: download worker src
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
  let pdfDoc = null;
  let pageNumPending = null;
  pageRendering = true;

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  async function renderPage(num) {
    try {
      // fetch page
      console.log('rendering page...', num);
      const page = await pdfDoc.getPage(num);
      const canvas = document.getElementById('the-canvas');
      const viewport = page.getViewport(1);
      canvas.width = viewport.width;
      canvas.height = 550;
      const scale = Math.min(
        canvas.width / viewport.width,
        canvas.height / viewport.height);
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: page.getViewport(scale)
      };
      // Wait for rendering to finish
      await page.render(renderContext);
      pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      // Update page counters
      document.getElementById('page_num').textContent = num;
    } catch (err) {
      console.log(err);
    }
  }

  // Creates thumb-sized canvas elements and renders the pages inside
  function makeThumb(page) {
    // draw page to fit into 96x96 canvas
    const thumbCanvas = document.createElement('canvas');
    const vp = page.getViewport(1);
    thumbCanvas.width = 147;
    thumbCanvas.height = 147;
    const scale = Math.min(thumbCanvas.width / vp.width, thumbCanvas.height / vp.height);
    thumbCanvas.classList.add('thumb');
    return page.render({
      canvasContext: thumbCanvas.getContext('2d'),
      viewport: page.getViewport(scale)
    }).promise.then(() => thumbCanvas);
  }

   /**
    * Page Handling
    * If another page rendering in progress, waits until the rendering is
    * finised. Otherwise, executes rendering immediately.
    */
   function queueRenderPage(num) {
     if (pageRendering) {
       pageNumPending = num;
     } else {
       renderPage(num);
     }
   }

   function selectThumb(thumbNum) {
    const pageThumb = document.querySelector(`[data-page-num="${thumbNum}"]`);
    const prev = document.querySelector('.focus');
    if (prev) {
      prev.classList.remove('focus');
    }
    pageThumb.classList.add('focus');
   }

   function selectPage() {
     const prev = document.querySelector('.focus');
     const pageThumb = this;
     if (prev) {
       prev.classList.remove('focus');
     }
     pageThumb.classList.add('focus');
     pageNum = parseInt(pageThumb.dataset.pageNum, 10);
     console.log({
       pageThumb,
       prev
     });
     queueRenderPage(pageNum);
     buildAudioDz();
   }

   function onPrevPage() {
     if (pageNum <= 1) {
       return;
     }
     pageNum--;
     queueRenderPage(pageNum);
     selectThumb(pageNum);
     buildAudioDz();
   }

   function onNextPage() {
     if (pageNum >= pdfDoc.numPages) {
       return;
     }
     pageNum++;
     queueRenderPage(pageNum);
     selectThumb(pageNum);
     buildAudioDz();
   }

   document.getElementById('prev').addEventListener('click', onPrevPage);
   document.getElementById('next').addEventListener('click', onNextPage);

   /**
    * Asynchronously downloads PDF.
    */

  try {
    const pdfDoc_ = await pdfjsLib.getDocument(url);
    if (!pdfDoc_) {
      return new Error('Invalid URL');
    }
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;
    // Initial/first page rendering
    renderPage(pageNum);

    /**
     * Asynchronously Builds PDF Thumbs.
     */
    const thumbnailSlider = document.querySelector('#thumbnail-slider');
    const pages = [];
    while (pages.length < pdfDoc.numPages) pages.push(pages.length + 1);
    return Promise.all(pages.map((num) => {
      // create a li for each page and build a small canvas for it
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      li.addEventListener('click', selectPage);
      li.dataset.pageNum = num;
      thumbnailSlider.appendChild(li);
      return pdfDoc.getPage(num).then(makeThumb)
        .then((thumbCanvas) => {
          a.appendChild(thumbCanvas);
          li.appendChild(a);
        });
    }));
  } catch (err) {
    console.log(err.message);
  }
}

/*
******** Ajax Requests ********
*/
// TODO: Implement in editing existing presentation
// async function retrieveAudioById(presentId) {
//   try {
//     console.log(`fetching audio with ID ${presentId}...`);
//     const res = await fetch(`/api/audio/${presentId}`);
//     const presAudioArr = await res.json();
//     if (!res.ok) throw new Error('Could not retrieve PDF');
//     audioArr = presAudioArr.slice(0);
//     return buildAudioSelect();
//   } catch (err) {
//     return console.log(err);
//   }
// }
async function retrievePdf() {
  try {
    const res = await fetch('api/pdf', { credentials: 'include' });
    const pdf = await res.json();
    if (res.status === 400) throw new Error('Could not retrieve PDF');
    return pdfEditor(pdf);
  } catch (err) {
    console.error(err);
  }
}
async function retrieveAudio() {
  try {
    const res = await fetch('api/audio', { credentials: 'include' });
    const presAudioArr = await res.json();
    if (res.status === 400) throw new Error('Could not retrieve Audio');
    audioArr = presAudioArr.slice(0);
    return buildAudioDz();
  } catch (err) {
    console.error(err);
  }
}
async function updateAudio(data) {
  try {
    const res = await fetch('api/audio', {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const audio = await res.json();
    return audio;
  } catch (err) {
    console.log(err);
  }
}
async function updatePresentation(data) {
  try {
    const res = await fetch('api/presentation', {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const presentation = await res.text();
    return presentation;
  } catch (err) {
    console.error(err);
  }
}

/*
******** Submit Presentation ********
*/
function submitPresentation(e) {
  e.preventDefault();
  const tags = document.querySelector('input[name="tags"]').value;
  const title = document.querySelector('input[name="title"]').value;
  const article = document.querySelector('textarea[name="article"]').value;
  Promise.all([
    updateAudio({ audioArr }), 
    updatePresentation({ tags, title, article })
  ]).then((res) => {
    window.location = `/view-presentation/?id=${res[1]}`;
  });
}
function submitListen() {
  const submit = document.querySelector('#submit');
  submit.addEventListener('click', submitPresentation);
}

/*
******** Function Exports ********
*/
export {
  retrievePdf,
  retrieveAudio,
  initAudioDropzone,
  submitListen,
};
