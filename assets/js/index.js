// navigator.mediaDevices.getUserMedia({ video:true })

document.querySelector('button').addEventListener('click', async (e) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      document.querySelector('video').srcObject = stream
    } catch(e) {
      console.error(e)
    }
  })