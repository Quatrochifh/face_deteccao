// navigator.mediaDevices.getUserMedia({ video:true })
const cam = document.getElementById('cam')
console.log(cam)


const startVideo = () => {
  document.querySelector('button').addEventListener('click', async (e) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      document.querySelector('video').srcObject = stream
      // stream => cam.srcObject = stream
    } catch(e) {
      console.error(e)
    }
  })
}

const loadLabels = () => {
  const labels = ['fulano'] //nome da pasta entre aspas (pasta da label)
  labels.map(async label => {
      for (let i = 1; i <= 5; i++){
      const img = await faceapi.fetchImage(`/assets/lib/face-api/labels/${label}/${i}.jpg`) //pedindo pra api buscar uma imagem e passando aonde ela vai achar essa imagem
      }
  })
}

  Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/assets/lib/face-api/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/assets/lib/face-api/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/assets/lib/face-api/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/assets/lib/face-api/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/assets/lib/face-api/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/lib/face-api/models')
  ]).then(startVideo)


  if(cam){

    cam.addEventListener('play', async () => {
      const canvas = faceapi.createCanvasFromMedia(cam)
      const canvasSize = {
        width: cam.width,
        height: cam.height
      }
      faceapi.matchDimensions(canvas, canvasSize)
      document.body.appendChild(canvas)
      setInterval(async () => {
         const detections = await faceapi
         .detectAllFaces(
           cam, 
           new faceapi.TinyFaceDetectorOptions()
           )
           .withFaceLandmarks()
           .withFaceExpressions()
           .withAgeAndGender()
           const resizedDetections = faceapi.resizeResults(detections, canvasSize)
           canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
           faceapi.draw.drawDetections(canvas, resizedDetections)
           faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
           faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
           resizedDetections.forEach(detection => {
             const {age, gender, genderProbability} = detection
             new faceapi.draw.DrawTextField([
               `achamos que vc tem ${parseInt(age, 10)} anos`,
              //  `${gender} (${genderProbability})`
              ], detection.detection.box.topRight).draw(canvas)
            })
      }, 100)
    })
    
}
//   cam.addEventListener('play', async () => {
//     const canvas = faceapi.createCanvasFromMedia(cam)
//     const canvasSize = {
//         width: cam.width,
//         height: cam.height
//     }})
