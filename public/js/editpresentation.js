/**
 * Globals
 */
const mp3Arr = [];
let pageNum = 1;

/**
 * Build Audio Box
 */
// TODO: Select for current page
function buildAudioSelect(audioArr) {
  const selectBox = document.querySelector('#audio-box');

  audioArr.forEach((audio) => {
    selectBox.add(`<option>${audio}</option>`);
  });
}

/*
******** Presentation Viewport ********
*/
function pdfEditor(pdf) {
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
  console.log({ GlobalWorkerOptions: pdfjsLib.GlobalWorkerOptions });
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
  const desiredWidth = windowWidth / 2.3;
  const desiredHeight = 555;
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
}

/*
******** Audio Dropzone ********
*/
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
      const date = new Date().getTime();
      self.options.addRemoveLinks = true;
      self.options.dictRemoveFile = 'Delete';
      self.on('error', (err) => {
        console.log('dropzone upload err ', err);
      });
      self.on('addedfile', (file) => {
        console.log('new file added ', file);
      });
      self.on('sending', (file) => {
        file.fileMeta = {
          size: file.size,
          date
        };
        $('.meter').show();
      });
      self.on('totaluploadprogress', (progress) => {
        console.log('progress ', progress);
        $('.roller').width(`${progress}%`);
      });
      self.on('queuecomplete', (progress) => {
        // $('.meter').delay(999).slideUp(999);
      });
      self.on('success', (file, res) => {
        // retrieveMp3(res) ; // just send name to buildAudioBox() ?
        console.log({ file, res });
        mp3Arr.push(res);
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
function retrieveMp3(presentId) {
  // TODO: Implement in editing existing presentation
  console.log(`fetching audio with ID ${presentId}...`);
  fetch(`/api/audio/${presentId}`).then((audioArr) => {
    console.log(audioArr);
    return buildAudioSelect(audioArr);
  }, err => err);
}
async function retrievePdf() {
  try {
    const res = await fetch('api/pdf', { credentials: 'include' });
    if (!res.ok) throw new Error('Could not retrieve PDF');
    const pdf = await res.json();
    return pdfEditor(pdf);
  } catch (err) {
    return console.log(err);
  }
}

/*
******** Function Exports ********
*/
export {
  retrievePdf,
  retrieveMp3,
  initAudioDropzone,
};
