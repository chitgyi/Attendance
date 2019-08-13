<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-progress-linear :indeterminate="true" :active="show"></v-progress-linear>
      <v-flex xs12 md8>
        <material-card color="blue" title="Add Employee" text="Complete your profile">
          <v-form>
            <v-container py-0>
              <v-layout wrap>
                <v-flex xs12 md6>
                  <v-text-field v-model="name" class="purple-input" label="Employee Name" />
                </v-flex>
                <v-flex xs12 md6>
                  <v-text-field v-model="email" label="Email Address" class="purple-input" />
                </v-flex>
                <v-flex xs12 md6>
                  <v-text-field v-model="salary" class="purple-input" label="Salary" />
                </v-flex>
                <v-flex xs12 md6>
                  <v-text-field v-model="address" label="Address" class="purple-input" />
                </v-flex>
                <v-flex xs12 md6>
                  <v-text-field v-model="position" class="purple-input" label="Position" />
                </v-flex>
                <v-flex xs12 md6>
                  <v-text-field v-model="ph" label="Phone No" class="purple-input" />
                </v-flex>
                <v-flex xs12 md6>
                  <label id="label" for="img">Choose Image</label>
                  <input
                    id="img"
                    hidden
                    ref="image"
                    title="Choose an image"
                    @input="image_file"
                    type="file"
                    accept="image/jpeg"
                  />
                  <v-img class="img-circle" v-bind:src="file" width="120" height="120" alt></v-img>
                </v-flex>
                <v-flex xs12 text-xs-right>
                  <v-btn
                    :disabled="show"
                    class="mx-0 font-weight-light"
                    color="blue"
                    v-on:click="req "
                  >Add</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </material-card>
      </v-flex>
      <!-- <v-flex xs12 md4>
        <material-card class="v-card-profile">
          <v-avatar slot="offset" class="mx-auto d-block" size="130">
            <img src="https://demos.creative-tim.com/vue-material-dashboard/img/marc.aba54d65.jpg" />
          </v-avatar>
          <v-card-text class="text-xs-center">
            <h6 class="category text-gray font-weight-thin mb-3">CEO / CO-FOUNDER</h6>
            <h4 class="card-title font-weight-light">Alec Thompson</h4>
            <p
              class="card-description font-weight-light"
            >Don't be scared of the truth because we need to restart the human foundation in truth And I love you like Kanye loves Kanye I love Rick Owens’ bed design but the back is...</p>
            <v-btn color="success" round class="font-weight-light">Follow</v-btn>
          </v-card-text>
        </material-card>
      </v-flex>-->
    </v-layout>
  </v-container>
</template>
<style scropped>
.img-circle {
  cursor: default;
  border-radius: 50%;
  background-color: rgb(205, 211, 209);
  margin-top: 6px;
}
#label {
  padding: 5px;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  background-color: rgb(138, 202, 9);
}
</style>
<script>
import firebase from "firebase";
import { setTimeout } from "timers";
import request from "request";
import { URL } from "url";
export default {
  //

  data() {
    return {
      imageData: "",
      name: "",
      email: "",
      salary: "",
      position: "",
      ph: "",
      address: "",
      show: false,
      file: ""
    };
  },
  mounted() {},
  methods: {
    req() {
      let uuid = this.generateUUID();
      this.show = true;
      request(
        {
          method: "POST",
          timeout: 3500,
          url:
            "https://face.ap-southeast-1.myhuaweicloud.com/v2/05c036d45c0026ed2fd9c00b30629671/face-sets/test/faces",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token":
              "MIIaFwYJKoZIhvcNAQcCoIIaCDCCGgQCAQExDTALBglghkgBZQMEAgEwghgpBgkqhkiG9w0BBwGgghgaBIIYFnsidG9rZW4iOnsiZXhwaXJlc19hdCI6IjIwMTktMDgtMTRUMDM6MzY6MTcuNjQ5MDAwWiIsIm1ldGhvZHMiOlsicGFzc3dvcmQiXSwiY2F0YWxvZyI6W10sInJvbGVzIjpbeyJuYW1lIjoidGVfYWRtaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJ0ZV9hZ2VuY3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9laXBfaXB2NiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2l2YXNfdmNyX3ZjYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19yYzYiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfbm9kZWdyb3VwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2NpX21vdW50b2JzcG9zaXgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jZXNfYWd0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGJzX3JpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYm1zX2hwY19oMmxhcmdlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX2Vzc2QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb2RwcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JhdGNoX2Vjc19jbHVzdGVyIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2dwdV92MTAwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2JzX3FpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZHdzX3BvYyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VycyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX21lZXRpbmdfZW5kcG9pbnRfYnV5IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVlZXRpbmdfd2hpdGVib2FyZF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9mY3NfQmlvdGVjaCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc3F1aWNrZGVwbG95IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfVklTX0ludGwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfdm9sdW1lX3JlY3ljbGVfYmluIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmNjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZHBwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2JyX2h5YnJpZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Npc19hc3JfbG9uZyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19yZWN5Y2xlYmluIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19oYXJkYWNjb3VudF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tdWx0aV9iaW5kIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbmxwX210IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVlZXRpbmdfY3VycmVudF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfZnVuY3Rpb24iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9iYXRjaCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2ZpbmVfZ3JhaW5lZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Byb2plY3RfZGVsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbTZtdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c19yZXR5cGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hYWRfZnJlZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VpX2RheXVfZGxnIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcmRzX3BnOTQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2Vfc3ByaW5nY2xvdWRfcGh5c2ljYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLXNvdXRod2VzdC0yYiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Nmc3R1cmJvIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaHZfdmVuZG9yIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbXJzX2FybV9yYzMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfaGkzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tbm9ydGgtNGQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X3A0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcmRzaTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF90YXMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZXJ2aWNlc3RhZ2VfbWdyX2R0bSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tbm9ydGgtNGYiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb3RlZGdlX2Jhc2ljIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3BoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19oaXN0b3J5X2N1c3RvbV9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kYnNzX2ZyZWV0cmFpbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3dzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19wZXJpb2RpY190eXBlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2R3YW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc3NfYXJtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2dwdV9nNXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ub3NxbF9jcmVhdGVSZWRpcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19kaXNraW50ZW5zaXZlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWxiX21pZ3JhdGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb3RlZGdlX2NhbXB1cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VsYl9sb2dfb2FtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfdW52ZXJpZmllZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZndmFzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfb3BfZ2F0ZWRfaWNzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19yZXBfYWNjZWxlcmF0aW9uIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JjM19yczMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9haXNfYXBpX2ltYWdlX2FudGlfYWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kc3NfbW9udGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfYzZzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdWZzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGVjX21vbnRoX3VzZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vY2VhbmxpbmsiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92aXBfYmFuZHdpZHRoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfVklTIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX29sZF9yZW91cmNlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGNzX3JpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX3R0c19zaXNjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmdpdnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3Jlc3RvcmUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pdnNjcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lwdjZfZHVhbHN0YWNrIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZ2F0ZWRfZWNzX3JlY3ljbGViaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vY2VhbmJvb3N0ZXItdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pcnRjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmd3cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcHJvZ3Jlc3NiYXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pb3YtdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfYXJtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaGlsZW5zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX3Bvb2xfY2EiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kZHNfYXJtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9DTi1TT1VUSC0zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZGNzMV9jcnIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9icyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2dzc19mcmVlX3RyaWFsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2Jzc3AiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lcHMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3Jlc3RvcmVfYWxsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfMTIzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2VydmljZXN0YWdlX21ncl9hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9XZUxpbmtfZW5kcG9pbnRfYnV5IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3B0c19jaGFvcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Zjc19wYXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92cGNlcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfYXAtc291dGhlYXN0LTFlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc21uX2FwcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfYXAtc291dGhlYXN0LTFkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWYiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zbyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19hc2NlbmRfYWkxIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaWVmX2RldmljZV9kaXJlY3QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfY3JlYXRlR1JJbnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfdmdwdV9nNSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Fpc192Y20iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2VfYXJtX2NsdXN0ZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9yZXN0cmljdGVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1zb3V0aC0xZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfYXAtc291dGhlYXN0LTFjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2xvdWR0ZXN0X3B0X2h3SW5zdGFuY2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3NfZGNzMl9ldSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfcnUtbm9ydGh3ZXN0LTJjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX2Fzcl9zaG9ydF9zaXNjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYWlzX29jcl9wbGF0ZV9udW1iZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2Vfd2luIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdWxiX21paXRfdGVzdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX09CU19maWxlX3Byb3RvY29sIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfVmlkZW9fQ2FtcHVzIiwiaWQiOiIwIn1dLCJwcm9qZWN0Ijp7ImRvbWFpbiI6eyJ4ZG9tYWluX3R5cGUiOiJIV0NfSEsiLCJuYW1lIjoiQ2hpdFllQXVuZyIsImlkIjoiMDVjMDM2ZDQ1MzAwMjZlZDBmZDZjMDBiMzBiMGQzMDAiLCJ4ZG9tYWluX2lkIjoiZTg3ZjE0NWJhMGYyNDViMWIwMzI5NTJmNGNhYmZkNWQifSwibmFtZSI6ImFwLXNvdXRoZWFzdC0xIiwiaWQiOiIwNWMwMzZkNDVjMDAyNmVkMmZkOWMwMGIzMDYyOTY3MSJ9LCJpc3N1ZWRfYXQiOiIyMDE5LTA4LTEzVDAzOjM2OjE3LjY0OTAwMFoiLCJ1c2VyIjp7ImRvbWFpbiI6eyJ4ZG9tYWluX3R5cGUiOiJIV0NfSEsiLCJuYW1lIjoiQ2hpdFllQXVuZyIsImlkIjoiMDVjMDM2ZDQ1MzAwMjZlZDBmZDZjMDBiMzBiMGQzMDAiLCJ4ZG9tYWluX2lkIjoiZTg3ZjE0NWJhMGYyNDViMWIwMzI5NTJmNGNhYmZkNWQifSwibmFtZSI6ImNoaXRneWkiLCJwYXNzd29yZF9leHBpcmVzX2F0IjoiIiwiaWQiOiIwNWNjZGY3N2Y3ODAwZjgwMWYwOWMwMGI4ZDA1OWFkOCJ9fX0xggHBMIIBvQIBATCBlzCBiTELMAkGA1UEBhMCQ04xEjAQBgNVBAgMCUd1YW5nRG9uZzERMA8GA1UEBwwIU2hlblpoZW4xLjAsBgNVBAoMJUh1YXdlaSBTb2Z0d2FyZSBUZWNobm9sb2dpZXMgQ28uLCBMdGQxDjAMBgNVBAsMBUNsb3VkMRMwEQYDVQQDDApjYS5pYW0ucGtpAgkA3LMrXRBhahAwCwYJYIZIAWUDBAIBMA0GCSqGSIb3DQEBAQUABIIBABAFp4mryT5Eq3qtZ-Sd7E7PUmrMN4KFJBg7p4IKP5tWGEHyHCr3u4W-UGiujMB06bkHuyIHfnA4j2cYB-tmh90f6SP--0So0mSVIbCLNm2AWpWKz9bs3bWYes2LxPHJJ0HNuFROoM29UxGVOzWrPXLOplruzKGMHfY00cMtTUp+JStfQz5+7kJ+0BFY0Xf2FT9Ns7OEO+TglIfCw5XY4szDgNQ+dWypei481+xoZV6UoX9LyqqBLM19NkxA9x+HRTBf+xre3mh5KIkDXhVffA4+NiZucHgXTKPOHDDWGPTfSKYIiWm5j7PYdj8lWyNl+i083PUe45YeP6Um-EWAYXE="
          },
          json: true,
          body: {
            image_base64: this.file.substring(23),
            external_image_id: uuid,
            external_fields: {
              timestamp: 123,
              id: "employee"
            }
          }
        },
        (err, res, body) => {
          //console.log(err, res);
          if (res.statusCode == 200) {
            firebase
              .database()
              .ref("Employee")
              .push({
                id: uuid,
                name: this.name,
                address: this.address,
                salary: this.salary,
                position: this.position,
                ph: this.ph
              })
              .then(res => {
                alert("Inserted...");
              })
              .catch(err => {alert(err)});
            this.show = false;
          } else {
            this.show = false
            alert("Unable to Insert!");
          }
        }
      );
    },
    image_file(event) {
      this.getBase64(event.target.files[0]);
    },
    getBase64(file_img) {
      var reader = new FileReader();
      reader.readAsDataURL(file_img);
      reader.onload = () => {
        this.file = reader.result;
      };
      reader.onerror = error => {
        console.log("Error: ", error);
      };
    },
    generateUUID() {
      // Public Domain/MIT
      var d = new Date().getTime();
      if (
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
      ) {
        d += performance.now(); //use high-precision timer if available
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
    }
  }
};
</script>
