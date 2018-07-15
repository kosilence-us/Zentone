/**
 * Get Params from URL
 */
function getParams() {
  const search = window.location.search.substring(1);
  const params = JSON.parse(
    `{"${  search.replace(/&/g, '","').replace(/=/g,'":"').replace(/\+/g, '%20')  }"}`,
    (key, value) => key === "" ? value : decodeURIComponent(value));
  console.log(params.id);
  return params;
}

/**
******** Ajax Requests ********
*/
async function sendShare() {
  console.log('sending share...');
}

async function sendBookmark() {
  console.log('sending bookmark...');
}

async function removeBookmark() {
  console.log('removing bookmark...');
}

export async function retrieveDownload() {
    try {
      const params = getParams();
      const res = await fetch(`/api/pdf/${params.id}`);
      
      const pdf = await res.blob();
      console.log(pdf);
      
      // const file = JSON.stringify(pdf.fileUrl);
      // const blob = new Blob([file], { type: 'application/pdf' });
      const link = URL.createObjectURL(pdf);
      const downloadLink = document.querySelector('#download-link');
      // const fileUrl = new File(pdf.fileUrl);
      // console.log(pdf.fileUrl, fileUrl);
      downloadLink.setAttribute('href', link);
      console.log(downloadLink.href);
      // downloadLink.setAttribute('download', pdf.fileName);
    } catch (err) {
      console.error(err);
    }
}

/**
******** Social Functions ********
*/
function share(shareLink) {
  console.log(shareLink);
  shareLink.classList.add('social-selected');
  sendShare();
  shareLink.classList.remove('social-selected');
}

function bookmark(bookmarkLink) {
  if (bookmarkLink.classList.contains('social-selected')) {
    bookmarkLink.classList.remove('social-selected');
    removeBookmark();
  } else {
    bookmarkLink.classList.add('social-selected');
    sendBookmark();
  }
}

function download(downloadLink) {
  downloadLink.classList.add('social-selected');
  // retrieveDownload();
  downloadLink.classList.remove('social-selected');
}

function more(moreLink) {
  moreLink.classList.add('social-selected');
  moreLink.classList.remove('social-selected');
}

/**
******** Social Event Listeners ********
*/
export function addSocialListeners() {
  const shareLink = document.querySelector('#share');
  const bookmarkLink = document.querySelector('#bookmark');
  const downloadLink = document.querySelector('#download');
  const moreLink = document.querySelector('#more');
  shareLink.addEventListener('click', () => share(shareLink));
  bookmarkLink.addEventListener('click', () => bookmark(bookmarkLink));
  downloadLink.addEventListener('click', () => download(downloadLink));
  moreLink.addEventListener('click', () => more(moreLink));
}
