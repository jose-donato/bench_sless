import { addMetric } from "../utils/addMetric";

export default function Home() {
  const post = () => {
    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();

    reader.addEventListener('load', function () {
      /*const formData = new FormData();
      formData.append("name", file.name)
      formData.append("content", reader.result)
      for (var [key, value] of formData.entries()) {
        console.log(key, value);
      }*/
      const start = performance.now()
      fetch("/api/dominantColor", {
        method: "POST",
        body: reader.result
      })
        .then(res => res.text())
        .then(text => {
          const [rgb, functionDuration, imageType, imageDimensions] = text.split(";")
          const end = performance.now()
          const duration = end - start;
          document.getElementById("duration").textContent = duration;
          document.body.style.backgroundColor = "rgb(" + rgb + ")";
          addMetric(duration, "m1", "next-next_sless", imageType, imageDimensions)
          addMetric(functionDuration, "m2", "next_sless", imageType, imageDimensions)
        });
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }
  const onSubmit = () => {
    const file = document.querySelector('input[type=file]').files[0];
    if (file) {
      const formData = new FormData();
      formData.append("imageName", file.name)
      formData.append("")
      const start = performance.now()
      fetch("/api/dominantColor", {
        method: "POST",
        body: formData
      })
        .then(res => res.text())
        .then(text => {
          const [rgb, functionDuration, imageType, imageDimensions] = text.split(";")
          const end = performance.now()
          const duration = end - start;
          document.getElementById("duration").textContent = duration
          document.body.style.backgroundColor = "rgb(" + rgb + ")";
          addMetric(duration, "m1", "next-next_sless", imageType, imageDimensions)
          addMetric(functionDuration, "m2", "next_sless", imageType, imageDimensions)
        });
    }
  }
  return (
    <>
      <p>Upload an image (JPEG or PNG):</p>
      <input type="file" onChange={post} />
      <p>Duration <span id="duration"></span></p>
    </>
  )
}
