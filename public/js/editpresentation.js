/*
******** Presentation Viewport ********
*/
function pdfEditor(pdf) {
  // console.log('pdf loading data...', pdf);
  const windowWidth = window.innerWidth || document.body.clientWidth;
  const { fileName } = pdf.fileMeta;
  const url = `https://zentone4.oss-cn-beijing.aliyuncs.com/${fileName}`;
  const { id } = pdf.fileMeta;

  console.log(fileName);
  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.
  // const url = '//cdn.mozilla.net/pdfjs/tracemonkey.pdf';
  // Loaded via <script> tag, create shortcut to access PDF.js exports.
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  // The workerSrc property shall be specified.
  console.log('pdfjsLib', pdfjsLib);
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
  const desiredWidth = windowWidth / 2.3;
  const desiredHeight = 555;
  const canvas = document.getElementById('the-canvas');
  const ctx = canvas.getContext('2d');
  let pdfDoc = null;
  let pageNum = 1;
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

/**
 * Build Audio Box
 */
function buildAudioSelect(audioArr) {
  const selectBox = document.querySelector('#audio-box');

  audioArr.forEach((audio) => {
    selectBox.add(`<option>${audio}</option>`);
  });
}

/*
******** Ajax Requests ********
*/
function retrieveMp3(presentId) {
  console.log(`fetching audio with ID ${presentId}...`)
  fetch(`/api/audio/${presentId}`).then((audioArr) => {
    console.log(audioArr);
    return buildAudioSelect(audioArr);
  }, err => err);
}
function retrievePdf() {
  $.ajax({
    url: 'api/pdf/download',
    type: 'get',
    success(res) {
      console.log('request successfully retrieved slide!');
      console.log(res);
      pdfEditor(res);
    },
    error(err) {
      console.log(err);
    }
  });
}
function retrievePres() {
  console.log('retrieving presentation ID...');
  fetch('api/presentation').then((pres) => {
    retrievePdf(pres);
    // retrieveMp3(pres);
  }, err => err);
}

/*
******** Audio Dropzone ********
*/
function initAudioDropzone() {
  $('#audio-dropzone').dropzone({
    url: '/api/audio/upload',
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
        retrieveMp3(res); // just send name to buildAudioBox() ?
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
export {
  retrievePres,
  initAudioDropzone,
};
