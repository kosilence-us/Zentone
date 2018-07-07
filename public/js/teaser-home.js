/**
 * Globals
 */
let pageNum = 1;
let pageRendering = false;

/*
******** Presentation Viewport ********
*/
async function pdfViewer(pdf) {
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

  function selectPage() {
    const prev = document.querySelector('.focus');
    const pageThumb = this;
    if (prev) {
      prev.classList.remove('focus');
    }
    pageThumb.classList.add('focus');
    pageNum = parseInt(pageThumb.dataset.pageNum, 10);
    console.log({ pageThumb, prev });
    queueRenderPage(pageNum);
  }

  try {
    /**
     * Asynchronously downloads PDF.
     */
    const pdfDoc_ = await pdfjsLib.getDocument(url);
    if (!pdfDoc_) {
      return new Error('Invalid URL');
    }
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;
    // Initial/first page rendering
    renderPage(pageNum);
  } catch (err) {
    console.error(err.message);
  }
}

/*
******** Ajax Requests ********
*/
// TODO: get audio for presentation
async function retrieveLatestPdf() {
  try {
    const res = await fetch('/api/new/pdf', { credentials: 'include' });
    const pdf = await res.json();
    pdfViewer(pdf);
  } catch (err) {
    console.error(err);
  }
}

/*
******** Function Exports ********
*/
export {
  retrieveLatestPdf
};
