;(function () {
    ko.components.register("camera", {
        viewModel: function (params) {
            var errorLogger = params.errorLogger;

            var video = document.getElementById("camera"),
                videoObj = {
                    video: {
                        facingMode: "environment"
                    },
                    audio: false
                };

            function success(stream) {
                video.srcObject = stream;
            }
            function error(error) {
                switch (error.name) {
                    case "NotFoundError":
                    case "DevicesNotFoundError":
                        errorLogger.Log("Camera not found.", error);
                        break;
                    case "NotReadableError":
                    case "TrackStartError":
                        errorLogger.Log("Camera is already in use.", error);
                        break;
                    case "OverconstrainedError":
                    case "ConstraintNotSatisfiedError":
                        errorLogger.Log("Camera constraints could not be satisfied.", error);
                        break;
                    case "NotAllowedError":
                    case "PermissionDeniedError":
                        errorLogger.Log("Camera permissions denied.", error);
                        break;
                    default:
                        errorLogger.Log("Unknown error when initialising camera.", error);
                        break;
                }
            }

            function initAspectRatio() {
                var ar = video.clientHeight > video.clientWidth
                    ? video.clientHeight / video.clientWidth
                    : video.clientWidth / video.clientHeight;

                // Magic string, aspect ratio greater than this fails
                // TODO: Investigate why, fix
                if (ar > 2.4125)
                    ar = 2.4125;

                videoObj.video.aspectRatio = { ideal: ar };
            }

            async function resize() {
                initAspectRatio();
                if (video && video.srcObject) {
                    var tracks = video.srcObject.getTracks();
                    for (var i = 0; i < tracks.length; i++) {
                        tracks[i].applyConstraints(videoObj.video); 
                    }
                }
            }

            async function init() {
                try {
                    initAspectRatio();
                    var stream = await navigator.mediaDevices.getUserMedia(videoObj);
                    success(stream);
                }
                catch (e) {
                    error(e);
                }
            }

            init();

            window.addEventListener("resize", resize);
        },
        template: '\
            <video id="camera" autoplay playsinline></video>\
        '
    });
})();