<template>
  <v-container fill-height fluid grid-list-xl>
    <v-snackbar :timeout="timeout" :color="color" :top="top" v-model="snackbar" dark>
      <v-icon color="white" class="mr-3">mdi-bell-plus</v-icon>
      <div>
        <b>{{ message }}</b>
      </div>
      <v-icon size="16" @click="snackbar = false">mdi-close-circle</v-icon>
    </v-snackbar>
    <v-layout justify-space-around>
      <video id="video" ref="video" hidden width="500" height="380" autoplay />
      <canvas ref="vdo" width="500" height="380" />
      <div>
        <canvas ref="result" width="150px" />
        <!-- <v-img :src="image" hidden width="200" /> -->
        <h5>Name : {{ name }}</h5>
        <h5>Similarity : {{ similarity }}%</h5>
      </div>
    </v-layout>
  </v-container>
</template>

<style scropped>
</style>
<script>
import { setInterval, setTimeout } from "timers";
import pico from "pico-face-detect";
import request from "request";
import firebase, { firestore } from "firebase";
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
    //console.log("* cascade loaded");
  });
});
export default {
  data() {
    return {
      video: null,
      captures: [],
      canvas: null,
      resized: {},
      name: "",
      image: "",
      similarity: "",
      present: "",
      snackbar: false,
      top: true,
      timeout: 1500,
      message: "",
      color: ""
    };
  },
  created() {},
  mounted() {
    firestore()
      .collection("token")
      .get()
      .then(res => {
        res.forEach(doc => {
          window.token = doc.data().token;
          //console.log(window.token)
        });
      });
    this.video = this.$refs.video;
    this.canvas = this.$refs.vdo.getContext("2d");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.video.srcObject = stream;
      });
    } else {
      this.snack("Please update your webcam!", "error");
    }
    this.canvas.scale(-1, 1);
    this.canvas.translate(-500, 0);
    setInterval(() => {
      this.canvas.drawImage(this.video, 0, 0, 500, 380);
      this.detect(this.canvas);
    }, 1000 / 30);

    setInterval(() => this.result(), 4500);
  },
  methods: {
    result() {
      let img = this.canvas.getImageData(
        this.resized.x,
        this.resized.y,
        this.resized.w,
        this.resized.h
      );
      this.$refs.result
        .getContext("2d")
        .clearRect(0, 0, 500, 500);
      this.$refs.result.getContext("2d").putImageData(img, 0, 0);
      this.image = this.$refs.result.toDataURL();
      this.req();
    },
    detect(ctx) {
      window.isDetected = false;
      var rgba_to_grayscale = (rgba, nrows, ncols) => {
        var gray = new Uint8Array(nrows * ncols);
        for (var r = 0; r < nrows; ++r) {
          for (
            var c = 0;
            c < ncols;
            ++c // gray = 0.2*red + 0.7*green + 0.1*blue
          ) {
            gray[r * ncols + c] =
              (2 * rgba[r * 4 * ncols + 4 * c + 0] +
                7 * rgba[r * 4 * ncols + 4 * c + 1] +
                1 * rgba[r * 4 * ncols + 4 * c + 2]) /
              10;
          }
        }
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
      dets = pico.cluster_detections(dets, 0.2);

      for (i = 0; i < dets.length; ++i) {
        if (dets[i][3] > 50.0 && window.isDetected == false) {
          window.isDetected = true;
          dets[i][3] = 0;
          ctx.beginPath();
          ctx.rect(
            500 - dets[i][1] - dets[i][2] / 2,
            dets[i][0] - dets[i][2] / 2,
            dets[i][2],
            dets[i][2]
          );
          this.resized = {
            x: dets[i][1] - dets[i][2] / 2,
            y: dets[i][0] - dets[i][2] / 2,
            w: dets[i][2],
            h: dets[i][2]
          };
          ctx.lineWidth = 3;
          ctx.strokeStyle = "blue";
          ctx.stroke();
          ctx.clearRect(0, 0, ctx.width, ctx.height);
          // showResult(dets[i][0], dets[i][1], dets[i][2]);
          return;
        }
      }
    },
    req() {
      let today = new Date(Date.now());
      let month = today.getMonth() + 1 + "-" + today.getFullYear();
      let date = today.getDate() + "-" + month;
      request(
        {
          method: "POST",
          timeout: 3500,
          url:
            "https://face.ap-southeast-1.myhuaweicloud.com/v2/05c036d45c0026ed2fd9c00b30629671/face-sets/test/search",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": window.token
          },
          json: true,
          body: {
            image_base64: this.image.substring(22),
            sort: [
              {
                timestamp: "asc"
              }
            ],
            return_fields: ["timestamp", "id"]
          }
        },
        (err, res, body) => {
          let result = { similarity: 0, external_image_id: "unknown" };
          let present = firestore().collection("present");
          if (!err && res.statusCode == 200) {
            let obj = body.faces;
            if (body.error_code !== null) {
              for (var i = 0; i < obj.length; i++) {
                if (obj[i].similarity > 0.9) {
                  result = obj[i];
                  present
                    .where("eid", "==", result.external_fields.id)
                    .where("date", "==", date)
                    .get()
                    .then(res => {
                      if (res.empty) {
                        present
                          .add({
                            eid: result.external_fields.id,
                            date: date,
                            month: month
                          })
                          .then(res => {
                            this.snack(
                              result.external_image_id + " has been presented!",
                              "success"
                            );
                          });
                      } else {
                        this.snack(
                          result.external_image_id +
                            " has already been presented!",
                          "warning"
                        );
                      }
                    });

                  break;
                }
              }
            }
          }
          this.name = result.external_image_id.toUpperCase();
          this.similarity = result.similarity.toFixed(2) * 100;
        }
      );
    },
    snack(message, color) {
      this.color = color;
      this.message = message;
      this.snackbar = true;
    }
  },
  destroyed() {
    this.$refs.vdo.getContext("2d").clearRect(0, 0, 500, 380);
  }
};
</script>
