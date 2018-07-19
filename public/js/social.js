/**
 * Get Params from URL
 */
function getParams() {
  const search = window.location.search.substring(1);
  const params = JSON.parse(
    `{"${search.replace(/&/g, '","').replace(/=/g,'":"').replace(/\+/g, '%20')}"}`,
    (key, value) => key === "" ? value : decodeURIComponent(value));
  return params;
}

/**
******** Ajax Requests ********
*/
async function sendShare() {
  const params = JSON.stringify(getParams());
  console.log(params);
  try {
    const res = await fetch('/api/social/share', {
      method: 'POST',
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: params,
      credentials: 'include'
    });
    const result = await res.json();
    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
}

async function sendBookmark() {
  const params = JSON.stringify(getParams());
  try {
    const res = await fetch('/api/social/bookmark', {
      method: 'POST',
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: params,
      credentials: 'include' 
    });
    const result = await res.json();
    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
}

async function removeBookmark() {
  const params = JSON.stringify(getParams());
  try {
    const res = await fetch('/api/social/bookmark', {
      method: 'DELETE',
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: params,
      credentials: 'include'
    });
    const result = await res.json();
    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
}

async function sendDownload() {
  const params = JSON.stringify(getParams());
  try {
    const res = await fetch('/api/social/download', {
      method: 'POST',
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: params,
      credentials: 'include'
    });
    const result = await res.json();
    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
}

/**
******** Social Functions ********
*/
function share(shareLink) {
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
  sendDownload();
  downloadLink.classList.remove('social-selected');
}

function more(moreLink) {
  moreLink.classList.add('social-selected');
  moreLink.classList.remove('social-selected');
}

/**
******** Social Event Listeners ********
*/
export async function addSocialListeners() {
  const shareLink = document.querySelector('#share');
  const bookmarkLink = document.querySelector('#bookmark');
  const downloadLink = document.querySelector('#download');
  const moreLink = document.querySelector('#more');
  const params = getParams();
  const res = await fetch(`/api/social/bookmark/${params.id}`);
  const isBookmarked = await res.json();
  shareLink.addEventListener('click', () => share(shareLink));
  bookmarkLink.addEventListener('click', () => bookmark(bookmarkLink));
  downloadLink.addEventListener('click', () => download(downloadLink));
  moreLink.addEventListener('click', () => more(moreLink));
  console.log(isBookmarked);
  if (!isBookmarked.msg) {
    bookmarkLink.classList.add('social-selected');
  }
}
