let fileInput = document.querySelector("#fileInput");
let browseBtn = document.querySelector(".browsebtn");
let dropZone = document.querySelector(".drop-zone");

const maxAllowedSize = 100 * 1024 * 1024;

const baseURL = "https://innshare.herokuapp.com";
const uploadURL = `${baseURL}/api/files`;

browseBtn.addEventListener("click", (e) => {
  fileInput.click();
});
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});
dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  dropZone.classList.remove("dragged");
  if (files.length === 1) {
    fileInput.files = files;
    uploadFile();
  }
});

let uploadFile = () => {
  files = fileInput.files;
  const formData = new FormData();
  formData.append("myfile", files[0]);

  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = (e) => {
    console.log(e);
  };
  xhr.open("POST", uploadURL);
  xhr.send(formData);
};
