// TODO: Submit data function
// TODO: update audio entries with page data
/**
 * Globals
 */
let audioArr = [];
let pageNum = 1;

/**
 * Build Audio Box
 */
// TODO: Select for current page
function buildAudioSelect() {
  const selectBox = document.querySelector('#audio-box');
  const pageAudioArr = audioArr.filter(audio => audio.pageNum === pageNum);
  selectBox.textContent = '';
  console.info('Populating Select Box...');
  console.log(audioArr);

  pageAudioArr.forEach((audio) => {
    const option = document.createElement('option');
    option.textContent = audio.originalFileName;
    selectBox.appendChild(option);
  });
}

/*
******** Presentation Viewport ********
*/
// TODO: fix viewport scaling issue
async function pdfEditor(pdf) {
  console.log('pdf loading data...');
  console.log(pdf.fileUrl);
  if (!pdf) {
    return console.log('Could not retrieve PDF from current session');
  }

  const windowWidth = window.innerWidth || document.body.clientWidth;
  const url = pdf.fileUrl;
  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.
  // const url = '//cdn.mozilla.net/pdfjs/tracemonkey.pdf';
  // Loaded via <script> tag, create shortcut to access PDF.js exports.
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  // The workerSrc property shall be specified.
  // console.log(pdfjsLib.GlobalWorkerOptions);
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
  const desiredWidth = windowWidth / 2.3;
  const desiredHeight = 555;
  const thumbnailSlider = document.querySelector('#thumbnail-slider');
  const canvas = document.getElementById('the-canvas');
  const ctx = canvas.getContext('2d');
  let pdfDoc = null;
  let pageRendering = false;
  let pageNumPending = null;

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport(1);
      const scale = desiredHeight / viewport.height;
      const scaledViewport = page.getViewport(scale);
      canvas.height = scaledViewport.height;
      canvas.width = desiredWidth;
      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: ctx,
        viewport
      };
      const renderTask = page.render(renderContext);
      // Wait for rendering to finish
      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });
    // Update page counters
    document.getElementById('page_num').textContent = num;
  }
  /**
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
  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  document.getElementById('prev').addEventListener('click', onPrevPage);
  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  document.getElementById('next').addEventListener('click', onNextPage);
  /**
   * Asynchronously downloads PDF.
   */
  pdfjsLib.getDocument(url).then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });
  function makeThumb(page) {
    // draw page to fit into 96x96 canvas
    const vp = page.getViewport(1);
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const scale = Math.min(canvas.width / vp.width, canvas.height / vp.height);
    return page.render({ canvasContext: canvas.getContext('2d'), viewport: page.getViewport(scale) }).promise.then(() => canvas);
  }
  console.log('page rendered.');
  pdfjsLib.getDocument(url).promise.then((doc) => {
    console.log('building thumbs...', doc);
    const pages = [];
    while (pages.length < doc.numPages) pages.push(pages.length + 1);
    return Promise.all(pages.map((num) => {
      // create a li for each page and build a small canvas for it
      const li = document.createElement('li');
      document.body.appendChild(li);
      return doc.getPage(num).then(makeThumb)
        .then((canvas) => {
          li.appendChild(canvas);
          thumbnailSlider.appendChild(li);
          console.log(li);
          console.log(thumbnailSlider);
        });
    }));
  }).catch(console.error);
}

/*
******** Audio Dropzone ********
*/
// TODO: migrate from jQuery
function initAudioDropzone() {
  $('#audio-dropzone').dropzone({
    url: '/api/audio',
    maxFilesize: 50, // mb
    uploadMultiple: false,
    addRemoveLinks: true,
    dictResponseError: 'Server not Configured',
    acceptedFiles: '.mp3',
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
        // console.log(res);
        audioArr.push(res);
        buildAudioSelect();
      });
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
******** XML HTTP Requests ********
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
async function retrieveAudio() {
  try {
    const res = await fetch('api/audio', { credentials: 'include' });
    const presAudioArr = await res.json();
    if (res.status === 400) throw new Error('Could not retrieve Audio');
    audioArr = presAudioArr.slice(0);
    return buildAudioSelect();
  } catch (err) {
    return console.error(err);
  }
}
async function retrievePdf() {
  try {
    const res = await fetch('api/pdf', { credentials: 'include' });
    const pdf = await res.json();
    if (res.status === 400) throw new Error('Could not retrieve PDF');
    return pdfEditor(pdf);
  } catch (err) {
    return console.error(err);
  }
}

/*
******** Function Exports ********
*/
export {
  retrievePdf,
  retrieveAudio,
  initAudioDropzone,
};
