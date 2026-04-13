function triggerUpload() {
  document.getElementById("imageInput").click();
}

async function detectFace() {
  const endpoint = document.getElementById("endpoint").value;
  const key = document.getElementById("key").value;
  const fileInput = document.getElementById("imageInput");

  if (!endpoint || !key || fileInput.files.length === 0) {
    alert("Please fill all fields!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function () {
    const imageData = reader.result;
    const blob = await fetch(imageData).then(res => res.blob());

    try {
      const response = await fetch(endpoint + "/vision/v3.2/analyze?visualFeatures=Faces", {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/octet-stream"
        },
        body: blob
      });

      const data = await response.json();

      if (!data.faces || data.faces.length === 0) {
        alert("No faces detected!");
        return;
      }

      drawFaces(imageData, data.faces);

    } catch (error) {
      alert("Error: " + error);
    }
  };

  reader.readAsDataURL(file);
}

function drawFaces(imageSrc, faces) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = imageSrc;

  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 3;

    faces.forEach(face => {
      const rect = face.faceRectangle;
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
    });
  };
}