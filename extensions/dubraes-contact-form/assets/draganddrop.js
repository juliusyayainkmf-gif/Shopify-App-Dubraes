let dropZone = document.getElementById("drop-zone");
let fileInput = document.getElementById("fileInput");

if (dropZone && fileInput) {
  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files?.[0];
    showImage(file);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    showImage(file);
  });
}

function showImage(file) {
  dropZone = document.getElementById("drop-zone");

  if (!dropZone || !file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {

    dropZone.innerHTML = `<img src="${event.target.result}" style="width:100%;height:100%;object-fit:contain;">`;

  };

  reader.readAsDataURL(file);
}
