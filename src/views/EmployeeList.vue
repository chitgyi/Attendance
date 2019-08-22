<template>
  <v-container fill-height fluid>
    <v-dialog v-model="loading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          {{ loadmsg }}
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar :timeout="timeout" :color="color" :top="top" v-model="snackbar" dark>
      <div>
        <b>{{ message }}</b>
      </div>
    </v-snackbar>
    <v-dialog v-model="addDialog" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Pick Image</v-card-title>
        <v-card-text>
          <v-flex xs12 md6>
            <input ref="image" type="file" accept="image/jpeg" @input="image_file" />
          </v-flex>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" flat @click="addDialog = false">CANCEL</v-btn>
          <v-btn color="blue darken-1" flat @click="addImage()">UPLOAD</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="delDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Confirm</v-card-title>
        <v-card-text>Are you sure want to delete?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" flat @click="delDialog = false">CANCEL</v-btn>
          <v-btn color="blue darken-1" flat @click="deleteEmployee()">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout justify-center align-center>
      <v-dialog v-model="dialog" persistent max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ name }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm12 md6>
                  <v-text-field ref="email" v-model="email" label="Email" />
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field ref="position" v-model="position" label="Position" />
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field ref="salary" v-model="salary" label="Salary" />
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field ref="address" v-model="address" label="Address" />
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field ref="ph" v-model="ph" label="Phone No" />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" flat @click.native="dialog = false">CANCEL</v-btn>
            <v-btn color="blue darken-1" flat @click="save" @click.native="dialog = true">SAVE</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-flex md12>
        <material-card
          color="blue"
          flat
          full-width
          title="Employee Management"
          text="List of employees"
        >
          <v-data-table :headers="headers" :items="items" hide-actions>
            <template slot="headerCell" slot-scope="{ header }">
              <span class="subheading font-weight-light text--darken-3" v-text="header.text" />
            </template>
            <template slot="items" slot-scope="{ item }">
              <td>{{ item.name }}</td>
              <td>{{ item.position }}</td>
              <td>{{ item.address }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.ph }}</td>
              <td>{{ item.salary }}</td>
              <td class="text-xs-right">
                <v-tooltip top>
                  <v-icon
                    slot="activator"
                    dark
                    color="red"
                    @click="confirmDel(item.id, item.key)"
                  >mdi-delete</v-icon>
                  <span>Delete</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-icon
                    slot="activator"
                    dark
                    color="green"
                    @click="editEmployee(item)"
                  >mdi-account-edit</v-icon>
                  <span>Edit</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-icon
                    slot="activator"
                    dark
                    color="blue"
                    @click="pickImage(item)"
                  >mdi-account-box-multiple</v-icon>
                  <span>Add Image</span>
                </v-tooltip>
              </td>
            </template>
          </v-data-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<style scropped>
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
import request from "request";
export default {
  data: () => ({
    home: "home",
    headers: [
      {
        sortable: true,
        text: "Name",
        value: "name"
      },
      {
        sortable: false,
        text: "Position",
        value: "position"
      },
      {
        sortable: false,
        text: "Address",
        value: "address"
      },
      {
        sortable: false,
        text: "Email",
        value: "email"
      },
      {
        sortable: false,
        text: "Phone No",
        value: "ph"
      },
      {
        sortable: true,
        text: "Salary",
        value: "salary"
      },
      {
        sortable: false,
        text: "Actions",
        value: "actions",
        align: "right"
      }
    ],
    items: [],
    delDialog: false,
    dialog: false,
    addDialog: false,
    loading: false,
    loadmsg: "",
    file: "",
    top: true,
    snackbar: false,
    message: "",
    color: "warning",
    timeout: 2000,
    name: "",
    email: "",
    position: "",
    address: "",
    ph: "",
    salary: "",
    id: "",
    key: ""
  }),
  mounted() {
    firestore()
      .collection("token")
      .get()
      .then(res => {
        res.forEach(doc => {
          window.token = doc.data().token;
        });
      });
    this.getEmployee();
  },
  methods: {
    editEmployee(data) {
      this.id = data.id;
      this.name = data.name;
      this.email = data.email;
      this.position = data.position;
      this.ph = data.ph;
      this.address = data.address;
      this.salary = data.salary;
      this.key = data.key;
      this.dialog = true;
    },
    confirmDel(id, key) {
      this.id = id;
      this.key = key;
      this.delDialog = true;
    },
    deleteEmployee() {
      this.delDialog = false;
      this.loadDialog("Deleting...");
      request(
        {
          method: "DELETE",
          timeout: 3500,
          url:
            "https://face.ap-southeast-1.myhuaweicloud.com/v2/05c036d45c0026ed2fd9c00b30629671/face-sets/test/faces/batch",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": window.token
          },
          json: true,
          body: {
            filter: "id: " + this.id
          }
        },
        (err, res, body) => {
          if (res && res.statusCode == 200) {
            let year = new Date().getFullYear();
            firestore()
              .collection("employees")
              .doc(this.key)
              .delete()
              .then(res => {
                firestore()
                  .collection("present")
                  .where("eid", "==", this.id)
                  .get()
                  .then(res => {
                    res.forEach(sanp => {
                      firestore()
                        .collection("present")
                        .doc(sanp.id)
                        .delete();
                    });
                    this.items = [];
                    this.getEmployee();
                    this.loading = false;
                    this.snack("Deleted!", "success");
                  })
                  .catch(err => {
                    this.loading = false;
                    this.snack("Unable to Delete!", "error");
                  });
              });
          } else {
            this.loading = false;
            this.snack("Unable to Delete!", "error");
          }
        }
      );
    },
    pickImage(item) {
      this.id = item.id;
      this.name = item.name.split(" ").join("");
      this.addDialog = true;
    },
    addImage() {
      if (this.file) {
        this.addDialog = false;
        this.loadDialog("Adding Image...");
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
              external_image_id: this.name,
              external_fields: {
                timestamp: 2019,
                id: this.id
              }
            }
          },
          (err, res, body) => {
            if (res && res.statusCode == 200) {
              this.loading = false;
              this.snack("Upload Successfully!", "success");
            } else {
              this.loading = false;
              this.snack("Unable to upload!", "error");
            }
          }
        );
      } else {
        this.snack("Please pick an Image!", "info");
      }
      this.$refs.image.value = "";
      this.file = "";
    },
    getEmployee() {
      this.items = [];
      firestore()
        .collection("employees")
        .get()
        .then(res => {
          res.forEach(emp => {
            this.items.push({
              id: emp.data().id,
              name: emp.data().name,
              email: emp.data().email,
              position: emp.data().position,
              ph: emp.data().ph,
              salary: emp.data().salary,
              address: emp.data().address,
              key: emp.id
            });
          });
        });
    },
    save() {
      this.loadDialog("Updating...");
      if (parseInt(this.salary) < 1000) {
        this.snack("Invalid Salary", "warning");
        return;
      }
      if (this.name && this.email && this.ph && this.address && this.position) {
        let data = {
          email: this.email,
          address: this.address,
          ph: this.ph,
          position: this.position,
          salary: this.salary
        };
        this.updateData(data);
      }
    },
    updateData(data) {
      firestore()
        .collection("employees")
        .doc(this.key)
        .update(data)
        .then(() => {
          this.dialog = false;
          this.items = [];
          this.getEmployee();
          this.loading = false;
          this.snack("Updated...", "success");
        })
        .catch(err => {
          this.loading = false;
          this.snack("Unalbe to update!", "error");
        });
    },
    snack(message, color) {
      this.color = color;
      this.message = message;
      this.snackbar = true;
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
      reader.onerror = error => {};
    },
    loadDialog(msg) {
      this.loading = true;
      this.loadmsg = msg;
    }
  }
};
</script>
