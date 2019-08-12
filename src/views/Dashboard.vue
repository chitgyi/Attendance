<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout wrap>
      <video ref="video" id="video" hidden width="500" height="380" autoplay></video>
      <canvas ref="vdo" width="500" height="380"></canvas>
      <v-card width="180">
        <canvas ref="result" hidden width="180" height="200"></canvas>
        <v-img v-bind:src="image"></v-img>
        <v-card-title>Name : Chit Ye Aung</v-card-title>
        <v-card-title>Similarity : 90%</v-card-title>
        <v-card-title>Attended : Present</v-card-title>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import { setInterval, setTimeout } from "timers";
import pico from "pico-face-detect";
import axios from "axios";
import request from "request";

var update_memory = pico.instantiate_detection_memory(5); // we will use the detecions of the last 5 frames
var facefinder_classify_region = function(r, c, s, pixels, ldim) {
  return -1.0;
};
var cascadeurl =
  "https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder";
fetch(cascadeurl).then(function(response) {
  response.arrayBuffer().then(function(buffer) {
    var bytes = new Int8Array(buffer);
    facefinder_classify_region = pico.unpack_cascade(bytes);
    //console.log('* cascade loaded');
  });
});

export default {
  data() {
    return {
      video: null,
      captures: [],
      canvas: null,
      resized: {},
      image: ""
    };
  },

  mounted() {
    this.video = this.$refs.video;
    this.canvas = this.$refs.vdo.getContext("2d");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.video.srcObject = stream;
      });
    }
    this.canvas.scale(-1, 1);
    this.canvas.translate(-500, 0);
    setInterval(() => {
      this.canvas.drawImage(video, 0, 0, 500, 380);
      this.detect(this.canvas, this.video);
    }, 1000 / 30);

    setInterval(() => this.result(), 5000);
    
  },
  methods: {
    // capture() {
    //   this.canvas = this.$refs.canvas;
    //   var context = this.canvas
    //     .getContext("2d")
    //     .drawImage(this.video, 0, 0, 400, 300);
    //   this.captures.push(canvas.toDataURL("image/png"));
    // },
    result() {
      let img = this.canvas.getImageData(
        this.resized.x,
        this.resized.y,
        this.resized.w,
        this.resized.h
      );
      this.$refs.result.width = this.resized.w;
      this.$refs.result.height = this.resized.h;
      this.$refs.result.getContext("2d").putImageData(img, 0, 0);
      this.image = this.$refs.result.toDataURL("image/jpg");
      this.req()
    },
    detect(ctx, video) {
      window.isDetected = false;
      var rgba_to_grayscale = (rgba, nrows, ncols) => {
        var gray = new Uint8Array(nrows * ncols);
        for (var r = 0; r < nrows; ++r)
          for (var c = 0; c < ncols; ++c)
            // gray = 0.2*red + 0.7*green + 0.1*blue
            gray[r * ncols + c] =
              (2 * rgba[r * 4 * ncols + 4 * c + 0] +
                7 * rgba[r * 4 * ncols + 4 * c + 1] +
                1 * rgba[r * 4 * ncols + 4 * c + 2]) /
              10;
        return gray;
      };
      var rgba = ctx.getImageData(0, 0, 500, 380).data;
      // prepare input to `run_cascade`
      let image = {
        pixels: rgba_to_grayscale(rgba, 380, 500),
        nrows: 380,
        ncols: 500,
        ldim: 500
      };
      let params = {
        shiftfactor: 0.1, // move the detection window by 10% of its size
        minsize: 100, // minimum size of a face
        maxsize: 1000, // maximum size of a face
        scalefactor: 1.1 // for multiscale processing: resize the detection window by 10% when moving to the higher scale
      };
      let dets = pico.run_cascade(image, facefinder_classify_region, params);
      dets = update_memory(dets);
      //console.log(dets);
      dets = pico.cluster_detections(dets, 0.2);

      for (i = 0; i < dets.length; ++i) {
        if (dets[i][3] > 50.0 && window.isDetected == false) {
          window.isDetected = true;
          dets[i][3] = 0;
          ctx.beginPath();
          ctx.rect(
            400 - dets[i][1],
            dets[i][0] - dets[i][2] / 2,
            dets[i][2],
            dets[i][2]
          );
          this.resized = {
            x: dets[i][1] + 20 - dets[i][2] / 2,
            y: dets[i][0] - dets[i][2] / 2,
            w: dets[i][2],
            h: dets[i][2]
          };
          ctx.lineWidth = 3;
          ctx.strokeStyle = "blue";
          ctx.stroke();
          ctx.clearRect(0, 0, ctx.width, ctx.height);
          //showResult(dets[i][0], dets[i][1], dets[i][2]);
          return;
        }
      }
    },
    req() {
   
      request(
        {
          method: "POST",
          timeout: 3500,
          url: "http://localhost:9022/db/api",
          headers: {
            "Content-Type": "application/json"
          },
          json: true,
          body: {
            image: this.image.substring(22)
          }
        },
        (err, res, body) => {
          console.log(body);
        }
      );
    }
  }
};
</script>