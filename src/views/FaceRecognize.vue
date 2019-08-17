<template>
  <v-container fill-height fluid grid-list-xl>
    <v-snackbar :timeout="timeout" :color="color" :top="top" v-model="snackbar" dark>
      <v-icon color="white" class="mr-3">mdi-bell-plus</v-icon>
      <div>
        <b>{{message}}</b>
      </div>
      <v-icon size="16" @click="snackbar = false">mdi-close-circle</v-icon>
    </v-snackbar>
    <v-layout justify-space-around>
      <video ref="video" id="video" hidden width="500" height="380" autoplay></video>
      <canvas ref="vdo" width="500" height="380"></canvas>
      <div>
        <canvas ref="result" hidden></canvas>
        <img v-bind:src="image" />
        <h5>Name : {{name}}</h5>
        <h5>Similarity : {{similarity}}%</h5>
        <h5>Attended : Present</h5>
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
      image: "",
      name: "",
      similarity: "",
      present: "",
      snackbar: false,
      top: true,
      timestamp: 1500
    };
  },

  mounted() {
    window.date = "Date";
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
      this.canvas.drawImage(this.video, 0, 0, 500, 380);
      this.detect(this.canvas);
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

      this.$refs.result.getContext("2d").putImageData(img, 0, 0);
      this.image = this.$refs.result.toDataURL();
      this.$refs.result
        .getContext("2d")
        .clearRect(0, 0, this.resized.w, this.resized.h);
      this.req();
    },
    detect(ctx) {
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
            dets[i][2] + 10
          );
          this.resized = {
            x: dets[i][1] - dets[i][2] / 2,
            y: dets[i][0] - dets[i][2] / 2,
            w: dets[i][2],
            h: dets[i][2] + 10
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
          url:
            "https://face.ap-southeast-1.myhuaweicloud.com/v2/05c036d45c0026ed2fd9c00b30629671/face-sets/test/search",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token":
              "MIIaNAYJKoZIhvcNAQcCoIIaJTCCGiECAQExDTALBglghkgBZQMEAgEwghhGBgkqhkiG9w0BBwGgghg3BIIYM3sidG9rZW4iOnsiZXhwaXJlc19hdCI6IjIwMTktMDgtMTdUMTY6MTQ6NTAuOTMyMDAwWiIsIm1ldGhvZHMiOlsicGFzc3dvcmQiXSwiY2F0YWxvZyI6W10sInJvbGVzIjpbeyJuYW1lIjoidGVfYWRtaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJ0ZV9hZ2VuY3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9laXBfaXB2NiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19zcG90X2luc3RhbmNlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXZhc192Y3JfdmNhIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JjNiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9ub2RlZ3JvdXAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2lfbW91bnRvYnNwb3NpeCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nlc19hZ3QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kYnNfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ibXNfaHBjX2gybGFyZ2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfZXNzZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvZHBzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYmF0Y2hfZWNzX2NsdXN0ZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X3YxMDAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNfcWkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kd3NfcG9jIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXJzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ193aGl0ZWJvYXJkX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Zjc19CaW90ZWNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzcXVpY2tkZXBsb3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVNfSW50bCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c192b2x1bWVfcmVjeWNsZV9iaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Y2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kcHAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnJfaHlicmlkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX2Fzcl9sb25nIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JlY3ljbGViaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hhcmRhY2NvdW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX211bHRpX2JpbmQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfbXQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ19jdXJyZW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9mdW5jdGlvbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JhdGNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmluZV9ncmFpbmVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcHJvamVjdF9kZWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tNm10IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX3JldHlwZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FhZF9mcmVlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWlfZGF5dV9kbGciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfcGc5NCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tc291dGh3ZXN0LTJiIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2ZzdHVyYm8iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9odl92ZW5kb3IiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tcnNfYXJtX3JjMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19oaTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLW5vcnRoLTRlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19ncHVfcDQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNpMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3RhcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NlcnZpY2VzdGFnZV9tZ3JfZHRtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfYmFzaWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hpc3RvcnlfY3VzdG9tX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Ric3NfZnJlZXRyYWlsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfd3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3BlcmlvZGljX3R5cGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZHdhbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nzc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X2c1ciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX25vc3FsX2NyZWF0ZVJlZGlzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2Rpc2tpbnRlbnNpdmUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lbGJfbWlncmF0ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfY2FtcHVzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWxiX2xvZ19vYW0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF91bnZlcmlmaWVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmd2YXMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vcF9nYXRlZF9pY3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3JlcF9hY2NlbGVyYXRpb24iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmMzX3JzMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Fpc19hcGlfaW1hZ2VfYW50aV9hZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rzc19tb250aCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19jNnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91ZnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kZWNfbW9udGhfdXNlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFubGluayIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZpcF9iYW5kd2lkdGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3Nfb2xkX3Jlb3VyY2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfdHRzX3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z2l2cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NycyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2l2c2NzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXB2Nl9kdWFsc3RhY2siLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9nYXRlZF9lY3NfcmVjeWNsZWJpbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFuYm9vc3Rlci10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lydGMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z3dzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19wcm9ncmVzc2JhciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdi10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9oaWxlbnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfcG9vbF9jYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX0NOLVNPVVRILTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3MxX2NyciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZ3NzX2ZyZWVfdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNzcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VwcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZV9hbGwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF8xMjMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZXJ2aWNlc3RhZ2VfbWdyX2FybSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX1dlTGlua19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcHRzX2NoYW9zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmNzX3BheSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZwY2VwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zbW5fYXBwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfa2ciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2FwLXNvdXRoZWFzdC0xZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NvIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2FzY2VuZF9haTEiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfZGV2aWNlX2RpcmVjdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19jcmVhdGVHUklucyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc192Z3B1X2c1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYWlzX3ZjbSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV9hcm1fY2x1c3RlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX3Jlc3RyaWN0ZWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLXNvdXRoLTFmIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jbG91ZHRlc3RfcHRfaHdJbnN0YW5jZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rjc19kY3MyX2V1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9ydS1ub3J0aHdlc3QtMmMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfYXNyX3Nob3J0X3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9haXNfb2NyX3BsYXRlX251bWJlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV93aW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91bGJfbWlpdF90ZXN0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfT0JTX2ZpbGVfcHJvdG9jb2wiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WaWRlb19DYW1wdXMiLCJpZCI6IjAifV0sInByb2plY3QiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiYXAtc291dGhlYXN0LTEiLCJpZCI6IjA1YzAzNmQ0NWMwMDI2ZWQyZmQ5YzAwYjMwNjI5NjcxIn0sImlzc3VlZF9hdCI6IjIwMTktMDgtMTZUMTY6MTQ6NTAuOTMyMDAwWiIsInVzZXIiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiY2hpdGd5aSIsInBhc3N3b3JkX2V4cGlyZXNfYXQiOiIiLCJpZCI6IjA1Y2NkZjc3Zjc4MDBmODAxZjA5YzAwYjhkMDU5YWQ4In19fTGCAcEwggG9AgEBMIGXMIGJMQswCQYDVQQGEwJDTjESMBAGA1UECAwJR3VhbmdEb25nMREwDwYDVQQHDAhTaGVuWmhlbjEuMCwGA1UECgwlSHVhd2VpIFNvZnR3YXJlIFRlY2hub2xvZ2llcyBDby4sIEx0ZDEOMAwGA1UECwwFQ2xvdWQxEzARBgNVBAMMCmNhLmlhbS5wa2kCCQDcsytdEGFqEDALBglghkgBZQMEAgEwDQYJKoZIhvcNAQEBBQAEggEAbacvQPvznQrcxxi5l+VyppDDds4qJ6QeV2a+9qRjSerKDy60YlE1JLB+SNZfBQXnEdCNq-7VePJkriy6muDnYyzeqEm5wVmnEAgX2SDKVYCffQWGQlK1Qsjzml2YzZ34RQxVIrdsMy745sEl4TYyT7ZRYkCnTa0BUC5KZmSFR6ISJALd4ugcfowz-KDvmAe4oxL6AlaFro7-xm-WRkqU4nlIewOFmMgqImpslUV17g4dOC3KTdc3JW0FiFNrRvU4auxzeSmONJ7qR0szs4Oh4lNW0+9RbMBg7Xo9lktfy6U65NdxjUJSu3aOJifLjXvnIKDfpq6mJXXqIndEpuwRwQ=="
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
          let today = new Date();
          let month = today.getMonth() + "-" + today.getFullYear();
          let day = today.getDay() + "-" + month;
          let result = { similarity: 0, external_image_id: "unknown" };
          if (!err && res.statusCode == 200) {
            let obj = body.faces;
            if (body.error_code !== null) {
              for (var i = 0; i < obj.length; i++) {
                if (obj[i].similarity > 0.9) {
                  result = obj[i];
                  firebase
                    .database()
                    .ref("Present")
                    .child(month)
                    .orderByChild("date")
                    .equalTo(day)
                    .once("value", snaps => {
                      snaps.forEach(snap => {
                        if (snap.val().id === result.external_fields.id) {
                          this.snack(
                            result.external_image_id +
                              " has already been presented!",
                            "warning"
                          );
                        } else {
                          present
                            .child(month)
                            .push({
                              id: result.external_fields.id,
                              date: day
                            })
                            .then(res => {
                              this.snack(
                                result.external_image_id +
                                  " has been presented!",
                                "success"
                              );
                            });
                        }
                      });
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
      //   request(
      //     {
      //       method: "POST",
      //       timeout: 3500,
      //       url: "http://localhost:9022/db/api",
      //       headers: {
      //         "Content-Type": "application/json"
      //       },
      //       json: true,
      //       body: {
      //         image: this.image.substring(22)
      //       }
      //     },
      //     (err, res, body) => {
      //       console.log(body);
      //     }
      //   );
    },
    snack(message, color) {
      this.color = color;
      this.message = message;
      this.snackbar = true;
    }
  }
};
</script>