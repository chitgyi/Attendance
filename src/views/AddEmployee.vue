<template>
  <v-container fill-height fluid grid-list-xl>
    <v-snackbar :color="color" :top="top" v-model="snackbar" dark>
      <v-icon color="white" class="mr-3">mdi-bell-plus</v-icon>
      <div>
        <b>{{message}}</b>
      </div>
      <v-icon size="16" @click="snackbar = false">mdi-close-circle</v-icon>
    </v-snackbar>
    <v-layout justify-center wrap>
      <v-dialog v-model="show" hide-overlay persistent width="300">
        <v-card color="info" dark>
          <v-card-text>
            Adding Employee
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- <v-progress-linear :indeterminate="true" :active="show"></v-progress-linear> -->
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
                    v-on:click="req"
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
import { all } from "q";
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
      file: "",
      snackbar: false,
      top: true,
      color: "info",
      message: ""
      //   rules: [
      //     value => !!value || "Required.",
      //     value => (value || "").length <= 50 || "Max 50 characters",
      //     value => {
      //       const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //       return pattern.test(value) || "Invalid e-mail.";
      //     }
      //   ]
    };
  },
  mounted() {
    console.log(window.date);
  },
  methods: {
    req() {
      if (parseInt(this.salary) < 1000) {
        this.snack("Please enter correct salary!");
        return;
      }
      if (
        this.name &&
        this.file &&
        this.email &&
        this.salary &&
        this.position &&
        this.ph
      ) {
        firebase
          .database()
          .ref("Employee")
          .orderByChild("name")
          .equalTo(this.name)
          .once("value", snap => {
            if (snap.exists()) {
              this.snack("Employee's name is exist!", "error");
            } else {
              this.show = true;
              this.insertData();
            }
          });
      } else {
        this.snack("Please fill in blank input!", "warning");
      }
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
    },
    insertData() {
      let uuid = this.generateUUID();

      request(
        {
          method: "POST",
          timeout: 3500,
          url:
            "https://face.ap-southeast-1.myhuaweicloud.com/v2/05c036d45c0026ed2fd9c00b30629671/face-sets/test/faces",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token":
              "MIIaNAYJKoZIhvcNAQcCoIIaJTCCGiECAQExDTALBglghkgBZQMEAgEwghhGBgkqhkiG9w0BBwGgghg3BIIYM3sidG9rZW4iOnsiZXhwaXJlc19hdCI6IjIwMTktMDgtMTdUMTY6MTQ6NTAuOTMyMDAwWiIsIm1ldGhvZHMiOlsicGFzc3dvcmQiXSwiY2F0YWxvZyI6W10sInJvbGVzIjpbeyJuYW1lIjoidGVfYWRtaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJ0ZV9hZ2VuY3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9laXBfaXB2NiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19zcG90X2luc3RhbmNlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXZhc192Y3JfdmNhIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JjNiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9ub2RlZ3JvdXAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2lfbW91bnRvYnNwb3NpeCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nlc19hZ3QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kYnNfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ibXNfaHBjX2gybGFyZ2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfZXNzZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvZHBzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYmF0Y2hfZWNzX2NsdXN0ZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X3YxMDAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNfcWkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kd3NfcG9jIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXJzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ193aGl0ZWJvYXJkX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Zjc19CaW90ZWNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzcXVpY2tkZXBsb3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVNfSW50bCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c192b2x1bWVfcmVjeWNsZV9iaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Y2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kcHAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnJfaHlicmlkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX2Fzcl9sb25nIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JlY3ljbGViaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hhcmRhY2NvdW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX211bHRpX2JpbmQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfbXQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ19jdXJyZW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9mdW5jdGlvbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JhdGNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmluZV9ncmFpbmVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcHJvamVjdF9kZWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tNm10IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX3JldHlwZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FhZF9mcmVlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWlfZGF5dV9kbGciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfcGc5NCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tc291dGh3ZXN0LTJiIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2ZzdHVyYm8iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9odl92ZW5kb3IiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tcnNfYXJtX3JjMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19oaTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLW5vcnRoLTRlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19ncHVfcDQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNpMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3RhcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NlcnZpY2VzdGFnZV9tZ3JfZHRtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfYmFzaWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hpc3RvcnlfY3VzdG9tX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Ric3NfZnJlZXRyYWlsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfd3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3BlcmlvZGljX3R5cGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZHdhbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nzc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X2c1ciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX25vc3FsX2NyZWF0ZVJlZGlzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2Rpc2tpbnRlbnNpdmUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lbGJfbWlncmF0ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfY2FtcHVzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWxiX2xvZ19vYW0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF91bnZlcmlmaWVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmd2YXMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vcF9nYXRlZF9pY3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3JlcF9hY2NlbGVyYXRpb24iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmMzX3JzMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Fpc19hcGlfaW1hZ2VfYW50aV9hZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rzc19tb250aCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19jNnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91ZnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kZWNfbW9udGhfdXNlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFubGluayIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZpcF9iYW5kd2lkdGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3Nfb2xkX3Jlb3VyY2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfdHRzX3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z2l2cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NycyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2l2c2NzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXB2Nl9kdWFsc3RhY2siLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9nYXRlZF9lY3NfcmVjeWNsZWJpbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFuYm9vc3Rlci10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lydGMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z3dzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19wcm9ncmVzc2JhciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdi10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9oaWxlbnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfcG9vbF9jYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX0NOLVNPVVRILTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3MxX2NyciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZ3NzX2ZyZWVfdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNzcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VwcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZV9hbGwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF8xMjMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZXJ2aWNlc3RhZ2VfbWdyX2FybSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX1dlTGlua19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcHRzX2NoYW9zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmNzX3BheSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZwY2VwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zbW5fYXBwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfa2ciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2FwLXNvdXRoZWFzdC0xZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NvIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2FzY2VuZF9haTEiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfZGV2aWNlX2RpcmVjdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19jcmVhdGVHUklucyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc192Z3B1X2c1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYWlzX3ZjbSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV9hcm1fY2x1c3RlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX3Jlc3RyaWN0ZWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLXNvdXRoLTFmIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jbG91ZHRlc3RfcHRfaHdJbnN0YW5jZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rjc19kY3MyX2V1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9ydS1ub3J0aHdlc3QtMmMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfYXNyX3Nob3J0X3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9haXNfb2NyX3BsYXRlX251bWJlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV93aW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91bGJfbWlpdF90ZXN0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfT0JTX2ZpbGVfcHJvdG9jb2wiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WaWRlb19DYW1wdXMiLCJpZCI6IjAifV0sInByb2plY3QiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiYXAtc291dGhlYXN0LTEiLCJpZCI6IjA1YzAzNmQ0NWMwMDI2ZWQyZmQ5YzAwYjMwNjI5NjcxIn0sImlzc3VlZF9hdCI6IjIwMTktMDgtMTZUMTY6MTQ6NTAuOTMyMDAwWiIsInVzZXIiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiY2hpdGd5aSIsInBhc3N3b3JkX2V4cGlyZXNfYXQiOiIiLCJpZCI6IjA1Y2NkZjc3Zjc4MDBmODAxZjA5YzAwYjhkMDU5YWQ4In19fTGCAcEwggG9AgEBMIGXMIGJMQswCQYDVQQGEwJDTjESMBAGA1UECAwJR3VhbmdEb25nMREwDwYDVQQHDAhTaGVuWmhlbjEuMCwGA1UECgwlSHVhd2VpIFNvZnR3YXJlIFRlY2hub2xvZ2llcyBDby4sIEx0ZDEOMAwGA1UECwwFQ2xvdWQxEzARBgNVBAMMCmNhLmlhbS5wa2kCCQDcsytdEGFqEDALBglghkgBZQMEAgEwDQYJKoZIhvcNAQEBBQAEggEAbacvQPvznQrcxxi5l+VyppDDds4qJ6QeV2a+9qRjSerKDy60YlE1JLB+SNZfBQXnEdCNq-7VePJkriy6muDnYyzeqEm5wVmnEAgX2SDKVYCffQWGQlK1Qsjzml2YzZ34RQxVIrdsMy745sEl4TYyT7ZRYkCnTa0BUC5KZmSFR6ISJALd4ugcfowz-KDvmAe4oxL6AlaFro7-xm-WRkqU4nlIewOFmMgqImpslUV17g4dOC3KTdc3JW0FiFNrRvU4auxzeSmONJ7qR0szs4Oh4lNW0+9RbMBg7Xo9lktfy6U65NdxjUJSu3aOJifLjXvnIKDfpq6mJXXqIndEpuwRwQ=="
          },
          json: true,
          body: {
            image_base64: this.file.substring(23),
            external_image_id: this.name.split(" ").join(""),
            external_fields: {
              timestamp: 2019,
              id: uuid
            }
          }
        },
        (err, res, body) => {
          if (res && res.statusCode == 200) {
            firebase
              .database()
              .ref("Employee")
              .push({
                name: this.name,
                address: this.address,
                salary: this.salary,
                position: this.position,
                ph: this.ph,
                id: uuid,
                email: this.email
              })
              .then(res => {
                this.name = "";
                this.email = "";
                this.position = "";
                this.file = "";
                this.address = "";
                this.salary = "";
                this.ph = "";
                this.snack("Added Employee", "success");
              })
              .catch(err => {
                this.snack("Unable to Insert!", "error");
              });
            this.show = false;
          } else {
            console.log(body);
            this.show = false;
            this.snack("Unable to Insert!", "error");
          }
        }
      );
    },
    snack(message, color) {
      this.color = color;
      this.message = message;
      this.snackbar = true;
    }
  }
};
</script>
