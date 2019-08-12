<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-space-around>
      <video ref="video" id="video" hidden width="500" height="380" autoplay></video>
      <canvas ref="vdo" width="500" height="380"></canvas>
      <div>
        <canvas ref="result" hidden />

        <img width="200px" v-bind:src="image" />

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
      present: ""
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
              "MIIaFwYJKoZIhvcNAQcCoIIaCDCCGgQCAQExDTALBglghkgBZQMEAgEwghgpBgkqhkiG9w0BBwGgghgaBIIYFnsidG9rZW4iOnsiZXhwaXJlc19hdCI6IjIwMTktMDgtMTJUMTg6MDQ6NTQuNDEwMDAwWiIsIm1ldGhvZHMiOlsicGFzc3dvcmQiXSwiY2F0YWxvZyI6W10sInJvbGVzIjpbeyJuYW1lIjoidGVfYWRtaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJ0ZV9hZ2VuY3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9laXBfaXB2NiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2l2YXNfdmNyX3ZjYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19yYzYiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfbm9kZWdyb3VwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2NpX21vdW50b2JzcG9zaXgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jZXNfYWd0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGJzX3JpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYm1zX2hwY19oMmxhcmdlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX2Vzc2QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb2RwcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JhdGNoX2Vjc19jbHVzdGVyIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2dwdV92MTAwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2JzX3FpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZHdzX3BvYyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VycyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX21lZXRpbmdfZW5kcG9pbnRfYnV5IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVlZXRpbmdfd2hpdGVib2FyZF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9mY3NfQmlvdGVjaCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc3F1aWNrZGVwbG95IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfVklTX0ludGwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfdm9sdW1lX3JlY3ljbGVfYmluIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmNjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZHBwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2JyX2h5YnJpZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Npc19hc3JfbG9uZyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19yZWN5Y2xlYmluIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19oYXJkYWNjb3VudF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tdWx0aV9iaW5kIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbmxwX210IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVlZXRpbmdfY3VycmVudF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfZnVuY3Rpb24iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9iYXRjaCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2ZpbmVfZ3JhaW5lZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Byb2plY3RfZGVsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbTZtdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c19yZXR5cGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hYWRfZnJlZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VpX2RheXVfZGxnIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcmRzX3BnOTQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2Vfc3ByaW5nY2xvdWRfcGh5c2ljYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLXNvdXRod2VzdC0yYiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Nmc3R1cmJvIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaHZfdmVuZG9yIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbXJzX2FybV9yYzMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfaGkzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tbm9ydGgtNGQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X3A0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcmRzaTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF90YXMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZXJ2aWNlc3RhZ2VfbWdyX2R0bSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tbm9ydGgtNGYiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb3RlZGdlX2Jhc2ljIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3BoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19oaXN0b3J5X2N1c3RvbV9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kYnNzX2ZyZWV0cmFpbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3dzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19wZXJpb2RpY190eXBlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2R3YW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc3NfYXJtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2dwdV9nNXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ub3NxbF9jcmVhdGVSZWRpcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19kaXNraW50ZW5zaXZlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWxiX21pZ3JhdGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb3RlZGdlX2NhbXB1cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VsYl9sb2dfb2FtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfdW52ZXJpZmllZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZndmFzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfb3BfZ2F0ZWRfaWNzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19yZXBfYWNjZWxlcmF0aW9uIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JjM19yczMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9haXNfYXBpX2ltYWdlX2FudGlfYWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kc3NfbW9udGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfYzZzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdWZzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGVjX21vbnRoX3VzZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vY2VhbmxpbmsiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92aXBfYmFuZHdpZHRoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfVklTIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX29sZF9yZW91cmNlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGNzX3JpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX3R0c19zaXNjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmdpdnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3Jlc3RvcmUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pdnNjcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lwdjZfZHVhbHN0YWNrIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZ2F0ZWRfZWNzX3JlY3ljbGViaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vY2VhbmJvb3N0ZXItdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pcnRjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmd3cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcHJvZ3Jlc3NiYXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb3YtdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfYXJtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaGlsZW5zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX3Bvb2xfY2EiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kZHNfYXJtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9DTi1TT1VUSC0zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGNzMV9jcnIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9icyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2dzc19mcmVlX3RyaWFsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2Jzc3AiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lcHMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3Jlc3RvcmVfYWxsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfMTIzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2VydmljZXN0YWdlX21ncl9hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9XZUxpbmtfZW5kcG9pbnRfYnV5IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3B0c19jaGFvcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Zjc19wYXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92cGNlcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfYXAtc291dGhlYXN0LTFlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc21uX2FwcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfYXAtc291dGhlYXN0LTFkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWYiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zbyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19hc2NlbmRfYWkxIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaWVmX2RldmljZV9kaXJlY3QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfY3JlYXRlR1JJbnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfdmdwdV9nNSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Fpc192Y20iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2VfYXJtX2NsdXN0ZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9yZXN0cmljdGVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1zb3V0aC0xZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfYXAtc291dGhlYXN0LTFjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2xvdWR0ZXN0X3B0X2h3SW5zdGFuY2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3NfZGNzMl9ldSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfcnUtbm9ydGh3ZXN0LTJjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX2Fzcl9zaG9ydF9zaXNjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYWlzX29jcl9wbGF0ZV9udW1iZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2Vfd2luIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdWxiX21paXRfdGVzdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX09CU19maWxlX3Byb3RvY29sIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfVmlkZW9fQ2FtcHVzIiwiaWQiOiIwIn1dLCJwcm9qZWN0Ijp7ImRvbWFpbiI6eyJ4ZG9tYWluX3R5cGUiOiJIV0NfSEsiLCJuYW1lIjoiQ2hpdFllQXVuZyIsImlkIjoiMDVjMDM2ZDQ1MzAwMjZlZDBmZDZjMDBiMzBiMGQzMDAiLCJ4ZG9tYWluX2lkIjoiZTg3ZjE0NWJhMGYyNDViMWIwMzI5NTJmNGNhYmZkNWQifSwibmFtZSI6ImFwLXNvdXRoZWFzdC0xIiwiaWQiOiIwNWMwMzZkNDVjMDAyNmVkMmZkOWMwMGIzMDYyOTY3MSJ9LCJpc3N1ZWRfYXQiOiIyMDE5LTA4LTExVDE4OjA0OjU0LjQxMDAwMFoiLCJ1c2VyIjp7ImRvbWFpbiI6eyJ4ZG9tYWluX3R5cGUiOiJIV0NfSEsiLCJuYW1lIjoiQ2hpdFllQXVuZyIsImlkIjoiMDVjMDM2ZDQ1MzAwMjZlZDBmZDZjMDBiMzBiMGQzMDAiLCJ4ZG9tYWluX2lkIjoiZTg3ZjE0NWJhMGYyNDViMWIwMzI5NTJmNGNhYmZkNWQifSwibmFtZSI6ImNoaXRneWkiLCJwYXNzd29yZF9leHBpcmVzX2F0IjoiIiwiaWQiOiIwNWNjZGY3N2Y3ODAwZjgwMWYwOWMwMGI4ZDA1OWFkOCJ9fX0xggHBMIIBvQIBATCBlzCBiTELMAkGA1UEBhMCQ04xEjAQBgNVBAgMCUd1YW5nRG9uZzERMA8GA1UEBwwIU2hlblpoZW4xLjAsBgNVBAoMJUh1YXdlaSBTb2Z0d2FyZSBUZWNobm9sb2dpZXMgQ28uLCBMdGQxDjAMBgNVBAsMBUNsb3VkMRMwEQYDVQQDDApjYS5pYW0ucGtpAgkA3LMrXRBhahAwCwYJYIZIAWUDBAIBMA0GCSqGSIb3DQEBAQUABIIBAA+2BqMC0Ml1DmPpOFTXKJg5qcFS9WSrNRIL60srdEDrwRX3f3KukcQP8gYPnJJOTlSKHa3reAEuemO0kOD2EdoBkLZHGWSxJt4ksYQm7Uci3HvWzZ7AKA1elJt8TS3FWAUXqKMEICVWXdL1hEw5gn-p4izZ7nFg4iH8dymnbgAImdHPwMzBkIXi+P0ORyjg+sZL-swt2W8NlFOafnA56HbK6Y7X-b1J-xJTMH3QGLN5MtU-FokytujjqQgmXI6Y65Lj3dVDt3zRDAYdjgSDHyNXz2ljDhE1uW1LB4I1u7JLr3rRfaUnisXeLnmMxfgi+ZbQ6vTvIr5CIiLS4pkK42E="
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

            // "external_image_id": "soelinnaing",
            // "external_fields": {
            //     "timestamp": 12555555,
            //     "id": "soesoe",
            // }
          }
        },
        (err, res, body) => {
          let result = { similarity: 0, external_image_id: "unknown" };
          if (!err && res.statusCode == 200) {
            let obj = body.faces;
            if (body.error_code !== null) {
              for (var i = 0; i < obj.length; i++) {
                if (obj[i].similarity > 0.9) {
                  result = obj[i];
                  break;
                }
              }
            }
          }
          this.name = result.external_image_id;
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
    }
  }
};
</script>