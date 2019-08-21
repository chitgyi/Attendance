<template>
  <v-container fill-height fluid grid-list-xl>
    <v-snackbar :color="color" :top="top" v-model="snackbar" dark>
      <v-icon color="white" class="mr-3">mdi-bell-plus</v-icon>
      <div>
        <b>{{ message }}</b>
      </div>
      <v-icon size="16" @click="snackbar = false">mdi-close-circle</v-icon>
    </v-snackbar>
    <v-layout justify-center wrap>
      <v-dialog v-model="show" hide-overlay persistent width="300">
        <v-card color="info" dark>
          <v-card-text>
            Adding Employee
            <v-progress-linear indeterminate color="white" class="mb-0" />
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
                    ref="image"
                    hidden
                    title="Choose an image"
                    type="file"
                    accept="image/jpeg"
                    @input="image_file"
                  />
                  <v-img :src="file" class="img-circle" width="120" height="120" alt />
                </v-flex>
                <v-flex xs12 text-xs-right>
                  <v-btn
                    :disabled="show"
                    style="color: white"
                    color="blue"
                    @click="req"
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
import firebase, { firestore } from "firebase";
import { setTimeout } from "timers";
import request from "request";

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
    firestore()
      .collection("token")
      .get()
      .then(res => {
        res.forEach(doc => {
          window.token = doc.data().token;
          console.log(window.token);
        });
      });
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
        //check employee's name
        firestore()
          .collection("employees")
          .where("name", "==", this.name)
          .get()
          .then(res => {
            if (!res.empty) {
              this.snack("Employee's name is exist!", "error");
              //console.log("Employee's name is exists!");
            } else {
              this.show = true;
              this.insertData();
            }
          });
        // firebase
        //   .database()
        //   .ref("Employee")
        //   .orderByChild("name")
        //   .equalTo(this.name)
        //   .once("value", snap => {
        //     if (snap.exists()) {
        //       this.snack("Employee's name is exist!", "error");
        //     } else {
        //       this.show = true;
        //       this.insertData();
        //     }
        //   });
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
        d += performance.now(); // use high-precision timer if available
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
            "X-Auth-Token": window.token
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
            firestore()
              .collection("employees")
              .add({
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
            this.snack("Please select correct image!", "error");
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
