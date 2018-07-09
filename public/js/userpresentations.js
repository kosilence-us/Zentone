/**
 * Globals
 */
const pageNum = 1;
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
      const canvasContainer = document.querySelector('.canvas-container');
      const ctx = canvas.getContext('2d');
      const viewport = page.getViewport(1);
      // Set scale and center page
      canvas.width = canvasContainer.offsetWidth;
      canvas.height = canvasContainer.offsetHeight;
      const scaleX = canvas.width / viewport.width;
      const scaleY = canvas.height / viewport.height;
      const scale = Math.min(scaleX, scaleY);
      const pageSize = Math.min(viewport.height, viewport.width) * scale;
      const containerSize = Math.min(canvas.height, canvas.width);
      const translateDistance = (containerSize - pageSize) / 2;
      if (viewport.width > viewport.height) {
        ctx.translate(0, translateDistance);
      } else {
        ctx.translate(translateDistance, 0);
      }
      const renderContext = {
        canvasContext: ctx,
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
    } catch (err) {
      console.log(err.message);
    }
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
    // Initial/first page rendering
    renderPage(pageNum);
  } catch (err) {
    console.error(err.message);
  }
}

/*
 ******** Build Templates ********
 */
async function buildPresentations(entries) {
  console.log(entries);
  const [ pdfs, presentations ] = entries;
  const list = document.querySelector('#user__presentations-list');
  const source = document.querySelector('#user__presentation-item').innerHTML;
  const template = Handlebars.compile(source);

  await presentations.forEach((presentation) => {
    const entry = document.createElement('li');
    const { id, title, article } = presentation;
    const createdAt = moment(presentation.createdAt).format('MMMM Do YYYY');
    const context = { id, title, createdAt, article };
    entry.innerHTML = template(context);
    list.appendChild(entry);
  });
  pdfs.forEach((pdf) => {
    pdfViewer(pdf);
  });
}

/*
 ******** Ajax Requests ********
 */
async function retrievePdfsByUserId() {
  try {
    const res = await fetch('/api/user/pdfs', {
      credentials: 'include'
    });
    const pdfsArr = await res.json();
    return pdfsArr;
  } catch (err) {
    console.error(err);
  }
}
async function retrievePresentationsByUserId() {
  try {
    const res = await fetch('/api/user/presentations', {
      credentials: 'include'
    });
    const presentationsArr = await res.json();
    return presentationsArr;
  } catch (err) {
    console.error(err);
  }
}
async function runUserRetrievals() {
  try {
    const res = await Promise.all([
      retrievePdfsByUserId(),
      retrievePresentationsByUserId()
    ]);
    buildPresentations(res);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  runUserRetrievals
}