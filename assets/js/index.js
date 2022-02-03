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
  const labels = ['AnaLuiza','Lucas', 'Julia', 'Israel','Fabio', 'LucasProfessor', 'SauloProfessor', 'PriscilaProfessora', 'PauloProfessor'] //nome da pasta entre aspas (pasta da label)
  return Promise.all(labels.map(async label => {
    const descriptions = []
    for (let i = 1; i <= 3; i++) {
        const img = await faceapi.fetchImage(`/assets/lib/face-api/labels/${label}/${i}.jpeg`)//pedindo pra api buscar uma imagem e passando aonde ela vai achar essa imagem
      const detections = await faceapi
        .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor()
          descriptions.push(detections.descriptor)  
    }
    return new faceapi.LabeledFaceDescriptors(label, descriptions)
  }))
}

  Promise.all([ //redes neurais:
  faceapi.nets.tinyFaceDetector.loadFromUri('/assets/lib/face-api/models'), //detectar rostos (quadrado)
  faceapi.nets.faceLandmark68Net.loadFromUri('/assets/lib/face-api/models'), //desenhar os traços no rosto
  faceapi.nets.faceRecognitionNet.loadFromUri('/assets/lib/face-api/models'), //reconhecimento do rosto (nome)
  faceapi.nets.faceExpressionNet.loadFromUri('/assets/lib/face-api/models'), //detectar expressões faciais (emoções)
  faceapi.nets.ageGenderNet.loadFromUri('/assets/lib/face-api/models'), //detectar idade e gênero
  faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/lib/face-api/models') //usada internalmente para detectar o rosto
  ]).then(startVideo)


  if(cam){

    cam.addEventListener('play', async () => {
      const canvas = faceapi.createCanvasFromMedia(cam)
      const canvasSize = {
        width: cam.width,
        height: cam.height
      }
      const labels = await loadLabels()
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
           .withFaceDescriptors()
           const resizedDetections = faceapi.resizeResults(detections, canvasSize)
        const faceMatcher = new faceapi.FaceMatcher(labels, 0.6)
        const results = resizedDetections.map(d =>
            faceMatcher.findBestMatch(d.descriptor)
        )
           canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
           faceapi.draw.drawDetections(canvas, resizedDetections)
           faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
           faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
           resizedDetections.forEach(detection => {
             const {age, gender, genderProbability} = detection
             new faceapi.draw.DrawTextField([
               `achamos que você tem ${parseInt(age, 10)} anos`,
              //  `${gender} (${genderProbability})`
              ], detection.detection.box.topRight).draw(canvas)
            })
            results.forEach((result, index) => {
              const box = resizedDetections[index].detection.box
              const { label, distance } = result
              new faceapi.draw.DrawTextField([
                `${label} (${parseInt(distance * 100, 10)}% de acerto)`
              ], box.bottomRight).draw(canvas) 
            })
      }, 100)
    })
    
}
