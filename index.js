const video = document.getElementById('video');

async function loadTrainingData() {
	const labels = ['Linh']

	const faceDescriptors = []
	for (const label of labels) {
		const descriptors = []
		for (let i = 1; i <= 5 ; i++) {
			const image = await faceapi.fetchImage(`./data/${label}/${i}.jpg`)
			const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
			descriptors.push(detection.descriptor)
		}
		faceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors))
	}
	return faceDescriptors
}


let faceMatcher

const loadFaceAPI = async () => {
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    ])
    const trainingData = await loadTrainingData()
    const faceMatcher = new faceapi.FaceMatcher(trainingData, 0.6)
    console.log(faceMatcher)
	
}


function getCameraStream(){

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video : {} })
            .then( stream => {
                video.srcObject = stream;
        })
    }
}

video.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    
    const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
    }

    setInterval(async () => {
       const detects = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())

        .withFaceLandmarks()
        .withFaceExpressions()

        const resizedDetects = faceapi.resizeResults(detects, displaySize);
        canvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);

        for (const detection of resizedDetects) {
            const drawBox = new faceapi.draw.DrawBox(detection.detection. box, {
                
                label: faceMatcher ? faceMatcher.findBestMatch(detections.descriptor).toString()  : 'face'
            })
            drawBox.draw(canvas)
        }
       faceapi.draw.drawFaceLandmarks(canvas, resizedDetects )
       faceapi.draw.drawFaceExpressions(canvas, resizedDetects )

    },300);
})

loadFaceAPI().then(getCameraStream);