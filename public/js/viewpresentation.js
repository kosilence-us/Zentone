/**
 * Globals
 */
let audioArr = [];
let pageNum = 1;
let pageRendering = false;

/**
 * Get Params from URL
 */
function getParams() {
  const search = window.location.search.substring(1);
  const params = JSON.parse(
    `{"${  search.replace(/&/g, '","').replace(/=/g,'":"').replace(/\+/g, '%20')  }"}`,
    (key, value) => key === ""?value:decodeURIComponent(value));
    console.log(params.id);
    return params;
}

/**
 * Fill Audio SRC
 */
function fillAudioSrc() {
  const audio = document.querySelector('#audio');
  const thisAudio = audioArr.filter(audio => audio.pageNum === pageNum);
  if (thisAudio[0].fileUrl) {
    audio.src = thisAudio[0].fileUrl;
    audio.play();
  } else {
    console.info('no audio');
  }
}

/**
 * Build Blog
 */
function buildBlog(presentation) {
  const createdAt = moment(presentation.createdAt).format('MMMM Do YYYY');
  const blog = document.querySelector('#blog');
  const source = document.querySelector('#blog-template').innerHTML;
  const template = Handlebars.compile(source);
  const context = {
    title: presentation.title,
    createdAt,
    article: presentation.blog,
    tags: presentation.tags
  }
  blog.innerHTML = template(context);
}

/*
******** Presentation Viewport ********
*/
// TODO: fix viewport scaling issue
async function pdfViewer(pdf) {
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
  const canvas = document.getElementById('the-canvas');
  const ctx = canvas.getContext('2d');
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
  // TODO: Click event listener
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
    fillAudioSrc();
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
    fillAudioSrc();
  }
  document.getElementById('next').addEventListener('click', onNextPage);

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
async function retrievePdfById() {
  try {
    const params = getParams();
    const res = await fetch(`/api/pdf/${params.id}`);
    const pdf = await res.json();
    pdfViewer(pdf);
  } catch (err) {
    console.error(err);
  }
}
async function retrieveAudioByPresId() {
  try {
    const params = getParams();
    const res = await fetch(`/api/audio/${params.id}`);
    if (res.status === 404) throw new Error(`No Audio Found for ${params.id}`);
    const presAudioArr = await res.json();
    audioArr = presAudioArr.slice(0);
    fillAudioSrc();
  } catch (err) {
    console.error(err);
  }
}
async function retrievePresentationById() {
  try {
    const params = getParams();
    const res = await fetch(`/api/presentation/${params.id}`);
    const presentation = await res.json();
    buildBlog(presentation);
  } catch (err) {
    console.error(err);
  }
}

/*
******** Function Exports ********
*/
export {
  retrievePdfById,
  retrieveAudioByPresId,
  retrievePresentationById
};
