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
            "X-Auth-Token":
              "MIIaNAYJKoZIhvcNAQcCoIIaJTCCGiECAQExDTALBglghkgBZQMEAgEwghhGBgkqhkiG9w0BBwGgghg3BIIYM3sidG9rZW4iOnsiZXhwaXJlc19hdCI6IjIwMTktMDgtMTlUMTM6MjI6MTUuNTkwMDAwWiIsIm1ldGhvZHMiOlsicGFzc3dvcmQiXSwiY2F0YWxvZyI6W10sInJvbGVzIjpbeyJuYW1lIjoidGVfYWRtaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJ0ZV9hZ2VuY3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9laXBfaXB2NiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19zcG90X2luc3RhbmNlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXZhc192Y3JfdmNhIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JjNiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9ub2RlZ3JvdXAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2lfbW91bnRvYnNwb3NpeCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nlc19hZ3QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kYnNfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ibXNfaHBjX2gybGFyZ2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfZXNzZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvZHBzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYmF0Y2hfZWNzX2NsdXN0ZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X3YxMDAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNfcWkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kd3NfcG9jIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXJzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ193aGl0ZWJvYXJkX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Zjc19CaW90ZWNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzcXVpY2tkZXBsb3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVNfSW50bCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c192b2x1bWVfcmVjeWNsZV9iaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Y2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kcHAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnJfaHlicmlkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX2Fzcl9sb25nIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JlY3ljbGViaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hhcmRhY2NvdW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX211bHRpX2JpbmQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfbXQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ19jdXJyZW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9mdW5jdGlvbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JhdGNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmluZV9ncmFpbmVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcHJvamVjdF9kZWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tNm10IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX3JldHlwZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FhZF9mcmVlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWlfZGF5dV9kbGciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfcGc5NCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tc291dGh3ZXN0LTJiIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2ZzdHVyYm8iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9odl92ZW5kb3IiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tcnNfYXJtX3JjMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19oaTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLW5vcnRoLTRlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19ncHVfcDQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNpMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3RhcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NlcnZpY2VzdGFnZV9tZ3JfZHRtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfYmFzaWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hpc3RvcnlfY3VzdG9tX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Ric3NfZnJlZXRyYWlsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfd3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3BlcmlvZGljX3R5cGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZHdhbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nzc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X2c1ciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX25vc3FsX2NyZWF0ZVJlZGlzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2Rpc2tpbnRlbnNpdmUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lbGJfbWlncmF0ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfY2FtcHVzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWxiX2xvZ19vYW0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF91bnZlcmlmaWVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmd2YXMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vcF9nYXRlZF9pY3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3JlcF9hY2NlbGVyYXRpb24iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmMzX3JzMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Fpc19hcGlfaW1hZ2VfYW50aV9hZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rzc19tb250aCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19jNnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91ZnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kZWNfbW9udGhfdXNlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFubGluayIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZpcF9iYW5kd2lkdGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3Nfb2xkX3Jlb3VyY2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfdHRzX3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z2l2cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NycyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2l2c2NzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXB2Nl9kdWFsc3RhY2siLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9nYXRlZF9lY3NfcmVjeWNsZWJpbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFuYm9vc3Rlci10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lydGMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z3dzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19wcm9ncmVzc2JhciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdi10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9oaWxlbnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfcG9vbF9jYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX0NOLVNPVVRILTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3MxX2NyciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZ3NzX2ZyZWVfdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNzcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VwcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZV9hbGwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF8xMjMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZXJ2aWNlc3RhZ2VfbWdyX2FybSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX1dlTGlua19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcHRzX2NoYW9zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmNzX3BheSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZwY2VwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zbW5fYXBwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfa2ciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2FwLXNvdXRoZWFzdC0xZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NvIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2FzY2VuZF9haTEiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfZGV2aWNlX2RpcmVjdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19jcmVhdGVHUklucyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc192Z3B1X2c1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYWlzX3ZjbSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV9hcm1fY2x1c3RlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX3Jlc3RyaWN0ZWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLXNvdXRoLTFmIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jbG91ZHRlc3RfcHRfaHdJbnN0YW5jZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rjc19kY3MyX2V1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9ydS1ub3J0aHdlc3QtMmMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfYXNyX3Nob3J0X3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9haXNfb2NyX3BsYXRlX251bWJlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV93aW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91bGJfbWlpdF90ZXN0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfT0JTX2ZpbGVfcHJvdG9jb2wiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WaWRlb19DYW1wdXMiLCJpZCI6IjAifV0sInByb2plY3QiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiYXAtc291dGhlYXN0LTEiLCJpZCI6IjA1YzAzNmQ0NWMwMDI2ZWQyZmQ5YzAwYjMwNjI5NjcxIn0sImlzc3VlZF9hdCI6IjIwMTktMDgtMThUMTM6MjI6MTUuNTkwMDAwWiIsInVzZXIiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiY2hpdGd5aSIsInBhc3N3b3JkX2V4cGlyZXNfYXQiOiIiLCJpZCI6IjA1Y2NkZjc3Zjc4MDBmODAxZjA5YzAwYjhkMDU5YWQ4In19fTGCAcEwggG9AgEBMIGXMIGJMQswCQYDVQQGEwJDTjESMBAGA1UECAwJR3VhbmdEb25nMREwDwYDVQQHDAhTaGVuWmhlbjEuMCwGA1UECgwlSHVhd2VpIFNvZnR3YXJlIFRlY2hub2xvZ2llcyBDby4sIEx0ZDEOMAwGA1UECwwFQ2xvdWQxEzARBgNVBAMMCmNhLmlhbS5wa2kCCQDcsytdEGFqEDALBglghkgBZQMEAgEwDQYJKoZIhvcNAQEBBQAEggEAhqRCfeyZaR9ral3Q6MpTolUjqmhUAjzCiyQTfFZFnRLVYbXEA2LHcnn6T2px0EL7GRCoeoTkr2pm5YsDJ-ML0qqsn1nE1uxAJ2ChenzqhRGorVVOlKjzeeZpcOKgtmYw9afblzlnJnPLZ3e963RP3mkCGgc6UqowRQybR-PPNcl+cP3p-yvPq6OVmso4WPHXxPJc7Ken7iZJLWrxUZgbtiqE8CjDkYYHPjIiRPsZgXdxFgtki5mjw5Ovt+4jODq30jjhiTiegMr4Hy9nZAMES3pzDhPVpPmrJhMvwpN6sW1ZF92bBAmGDLQKSgVJPKWYVKramHw7x7FYicEEMQK6jg=="
          },
          json: true,
          body: {
            filter: "id: " + this.id
          }
        },
        (err, res, body) => {
          console.log(body);
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
              "X-Auth-Token":
                "MIIaNAYJKoZIhvcNAQcCoIIaJTCCGiECAQExDTALBglghkgBZQMEAgEwghhGBgkqhkiG9w0BBwGgghg3BIIYM3sidG9rZW4iOnsiZXhwaXJlc19hdCI6IjIwMTktMDgtMTdUMTY6MTQ6NTAuOTMyMDAwWiIsIm1ldGhvZHMiOlsicGFzc3dvcmQiXSwiY2F0YWxvZyI6W10sInJvbGVzIjpbeyJuYW1lIjoidGVfYWRtaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJ0ZV9hZ2VuY3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9laXBfaXB2NiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19zcG90X2luc3RhbmNlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXZhc192Y3JfdmNhIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JjNiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9ub2RlZ3JvdXAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jY2lfbW91bnRvYnNwb3NpeCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nlc19hZ3QiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kYnNfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ibXNfaHBjX2gybGFyZ2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfZXNzZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvZHBzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYmF0Y2hfZWNzX2NsdXN0ZXIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X3YxMDAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNfcWkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kd3NfcG9jIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXJzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfbWVldGluZ19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ193aGl0ZWJvYXJkX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Zjc19CaW90ZWNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzcXVpY2tkZXBsb3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVNfSW50bCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c192b2x1bWVfcmVjeWNsZV9iaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Y2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kcHAiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnJfaHlicmlkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2lzX2Fzcl9sb25nIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JlY3ljbGViaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hhcmRhY2NvdW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX211bHRpX2JpbmQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfbXQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWVldGluZ19jdXJyZW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2llZl9mdW5jdGlvbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JhdGNoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmluZV9ncmFpbmVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcHJvamVjdF9kZWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tNm10IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX3JldHlwZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FhZF9mcmVlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWlfZGF5dV9kbGciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNfcGc5NCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tc291dGh3ZXN0LTJiIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfc2ZzdHVyYm8iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9odl92ZW5kb3IiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tcnNfYXJtX3JjMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19oaTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLW5vcnRoLTRlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19ncHVfcDQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9yZHNpMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3RhcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NlcnZpY2VzdGFnZV9tZ3JfZHRtIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfYmFzaWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2hpc3RvcnlfY3VzdG9tX2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Ric3NfZnJlZXRyYWlsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfd3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3BlcmlvZGljX3R5cGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZHdhbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nzc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X2c1ciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX25vc3FsX2NyZWF0ZVJlZGlzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2Rpc2tpbnRlbnNpdmUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lbGJfbWlncmF0ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdGVkZ2VfY2FtcHVzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWxiX2xvZ19vYW0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF91bnZlcmlmaWVkIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdmd2YXMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vcF9nYXRlZF9pY3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3JlcF9hY2NlbGVyYXRpb24iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmMzX3JzMyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Fpc19hcGlfaW1hZ2VfYW50aV9hZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rzc19tb250aCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19jNnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91ZnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kZWNfbW9udGhfdXNlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFubGluayIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZpcF9iYW5kd2lkdGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WSVMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3Nfb2xkX3Jlb3VyY2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfdHRzX3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z2l2cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NycyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2l2c2NzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXB2Nl9kdWFsc3RhY2siLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9nYXRlZF9lY3NfcmVjeWNsZWJpbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29jZWFuYm9vc3Rlci10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lydGMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Z3dzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19wcm9ncmVzc2JhciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2lvdi10cmlhbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9oaWxlbnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ldnNfcG9vbF9jYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rkc19hcm0iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX0NOLVNPVVRILTMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kY3MxX2NyciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2JzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZ3NzX2ZyZWVfdHJpYWwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jYnNzcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VwcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVzdG9yZV9hbGwiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF8xMjMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZXJ2aWNlc3RhZ2VfbWdyX2FybSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX1dlTGlua19lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcHRzX2NoYW9zIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZmNzX3BheSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZwY2VwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zbW5fYXBwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9ubHBfa2ciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2FwLXNvdXRoZWFzdC0xZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3NvIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2FzY2VuZF9haTEiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9pZWZfZGV2aWNlX2RpcmVjdCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Jkc19jcmVhdGVHUklucyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc192Z3B1X2c1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYWlzX3ZjbSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV9hcm1fY2x1c3RlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX3Jlc3RyaWN0ZWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfcmkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2NuLXNvdXRoLTFmIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jbG91ZHRlc3RfcHRfaHdJbnN0YW5jZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rjc19kY3MyX2V1IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9ydS1ub3J0aHdlc3QtMmMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zaXNfYXNyX3Nob3J0X3Npc2MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9haXNfb2NyX3BsYXRlX251bWJlciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV93aW4iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91bGJfbWlpdF90ZXN0IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfT0JTX2ZpbGVfcHJvdG9jb2wiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9WaWRlb19DYW1wdXMiLCJpZCI6IjAifV0sInByb2plY3QiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiYXAtc291dGhlYXN0LTEiLCJpZCI6IjA1YzAzNmQ0NWMwMDI2ZWQyZmQ5YzAwYjMwNjI5NjcxIn0sImlzc3VlZF9hdCI6IjIwMTktMDgtMTZUMTY6MTQ6NTAuOTMyMDAwWiIsInVzZXIiOnsiZG9tYWluIjp7Inhkb21haW5fdHlwZSI6IkhXQ19ISyIsIm5hbWUiOiJDaGl0WWVBdW5nIiwiaWQiOiIwNWMwMzZkNDUzMDAyNmVkMGZkNmMwMGIzMGIwZDMwMCIsInhkb21haW5faWQiOiJlODdmMTQ1YmEwZjI0NWIxYjAzMjk1MmY0Y2FiZmQ1ZCJ9LCJuYW1lIjoiY2hpdGd5aSIsInBhc3N3b3JkX2V4cGlyZXNfYXQiOiIiLCJpZCI6IjA1Y2NkZjc3Zjc4MDBmODAxZjA5YzAwYjhkMDU5YWQ4In19fTGCAcEwggG9AgEBMIGXMIGJMQswCQYDVQQGEwJDTjESMBAGA1UECAwJR3VhbmdEb25nMREwDwYDVQQHDAhTaGVuWmhlbjEuMCwGA1UECgwlSHVhd2VpIFNvZnR3YXJlIFRlY2hub2xvZ2llcyBDby4sIEx0ZDEOMAwGA1UECwwFQ2xvdWQxEzARBgNVBAMMCmNhLmlhbS5wa2kCCQDcsytdEGFqEDALBglghkgBZQMEAgEwDQYJKoZIhvcNAQEBBQAEggEAbacvQPvznQrcxxi5l+VyppDDds4qJ6QeV2a+9qRjSerKDy60YlE1JLB+SNZfBQXnEdCNq-7VePJkriy6muDnYyzeqEm5wVmnEAgX2SDKVYCffQWGQlK1Qsjzml2YzZ34RQxVIrdsMy745sEl4TYyT7ZRYkCnTa0BUC5KZmSFR6ISJALd4ugcfowz-KDvmAe4oxL6AlaFro7-xm-WRkqU4nlIewOFmMgqImpslUV17g4dOC3KTdc3JW0FiFNrRvU4auxzeSmONJ7qR0szs4Oh4lNW0+9RbMBg7Xo9lktfy6U65NdxjUJSu3aOJifLjXvnIKDfpq6mJXXqIndEpuwRwQ=="
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
            console.log(body);
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
          console.log(err);
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
      reader.onerror = error => {
        console.log("Error: ", error);
      };
    },
    loadDialog(msg) {
      this.loading = true;
      this.loadmsg = msg;
    }
  }
};
</script>
