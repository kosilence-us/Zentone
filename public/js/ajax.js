module.exports = function retrievePdf(file) {
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
