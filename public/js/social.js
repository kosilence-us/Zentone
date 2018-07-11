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

async function retrieveDownload() {
  console.log('retrieving download...');
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
  retrieveDownload();
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
