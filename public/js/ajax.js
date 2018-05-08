function retrievePdf(file) {
  console.log('---------ajax--------');
  console.log(file);
  $.ajax({
    url: 'api/download',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify({
      fileName: file.fileName
    }),
    success(res) {
      window.pdf = res;
      window.location = `http://${window.location.hostname}:3000/edit-presentation`;
      console.log('successfully retrieved slide!');
      console.log(res);
    },
    error(err) {
      console.log(err);
    }
  });
};

function retrieveMp3(file) {
  console.log('---------ajax--------');
  console.log(file);
  $.ajax({
    url: 'api/audio-download',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify({
      fileName: file.fileName
    }),
    success(res) {
      console.log('successfully retrieved mp3!');
      console.log(res);
      $('#audio-box').append(`<option>${res.fileMeta.originalFileName}</option>`);
    },
    error(err) {
      console.log(err);
    }
  });
}

module.exports = {
  retrievePdf,
  retrieveMp3
};
