<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-dialog persistent v-model="dialog" max-width="290">
        <v-card>
          <v-date-picker dark :max="maxDate" color="info" type="month" v-model="date"></v-date-picker>
          <v-card-actions>
            <v-spacer />
            <v-btn color="info darken-1" flat @click.native="dialog = false">CANCEL</v-btn>
            <v-btn color="info darken-1" flat @click="getMonth">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog persistent v-model="dDialog" max-width="290">
        <v-card>
          <v-date-picker dark :max="maxday" color="info" v-model="day"></v-date-picker>
          <v-card-actions>
            <v-spacer />
            <v-btn color="info darken-1" flat @click.native="dDialog = false">CANCEL</v-btn>
            <v-btn color="info darken-1" flat @click="getDay">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-flex md12>
        <v-card color="blue">
          <v-card-title class="title" style="color: white">
            Today Attended Employees
            <v-spacer></v-spacer>
            <v-tooltip top>
              <v-icon slot="activator" dark color="white" @click="pickDaily">mdi-calendar-multiple</v-icon>
              <span>Date</span>
            </v-tooltip>
          </v-card-title>
        </v-card>
        <v-data-table :headers="headers" :items="items" hide-actions>
          <template slot="headerCell" slot-scope="{ header }">
            <span class="subheading font-weight-light text--darken-3" v-text="header.text" />
          </template>
          <template slot="items" slot-scope="{ item }">
            <td>{{ item.name }}</td>
            <td>{{ item.position }}</td>
            <td>{{ item.date }}</td>
            <td class="text-xs-right">{{ item.address }}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex md12>
        <!-- <v-card-title color="info">
              <v-spacer></v-spacer>
              <div class="d-flex flex-row mb-3">
                <v-tooltip top>
                  <v-icon
                    slot="activator"
                    dark
                    color="blue"
                    @click="pickImage(item)"
                  >mdi-account-box-multiple</v-icon>
                  <span>Date</span>
                </v-tooltip>
                <v-text-field v-model="search" label="Search" single-line></v-text-field>
              </div>
        </v-card-title>-->
        <v-card color="blue">
          <v-card-title class="title" style="color: white">
            Monthly Attended Employees
            <v-spacer></v-spacer>
            <v-tooltip top>
              <v-icon slot="activator" dark color="white" @click="pickDate">mdi-calendar-multiple</v-icon>
              <span>Date</span>
            </v-tooltip>
          </v-card-title>
        </v-card>
        <v-data-table :search="search" :headers="mheaders" :items="mitems" hide-actions>
          <template slot="headerCell" slot-scope="{ header }">
            <span class="subheading font-weight-light text--darken-3" v-text="header.text" />
          </template>
          <template slot="items" slot-scope="{ item }">
            <td>{{ item.name }}</td>
            <td>{{ item.days }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.date }}</td>
            <td class="text-xs-right">{{ item.salary }}</td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import firebase, { firestore } from "firebase";
export default {
  data: () => ({
    dDialog: false,
    day: "",
    maxday: "",
    dialog: false,
    date: "",
    maxDate: "",
    search: "",
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
        sortable: true,
        text: "Date",
        value: "date"
      },
      {
        sortable: false,
        text: "Address",
        value: "address",
        align: "right"
      }
    ],
    mheaders: [
      {
        sortable: true,
        text: "Name",
        value: "name"
      },
      {
        sortable: true,
        text: "Number of Days",
        value: "days"
      },
      {
        sortable: false,
        text: "Email",
        value: "email"
      },
      {
        sortable: true,
        text: "Date",
        value: "date"
      },
      {
        sortable: true,
        text: "Salary(MMK)",
        value: "salary",
        align: "right"
      }
    ],
    items: [],
    id: [],
    mitems: []
  }),
  mounted() {
    let today = new Date(Date.now());
    let month =
      today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2);
    let date = month + "-" + today.getDate();
    this.date = month;
    this.day = date;
    this.maxday = date;
    this.maxDate = month;
    this.maxDay = date;
    // this.getTodayAttend();
    this.thisMonth(month);
    this.getTodayAttend(date);
  },
  methods: {
    getTodayAttend(date) {
      // this.items = [];
      // present per day
      let employee = firestore().collection("employees");
      firestore()
        .collection("present")
        .where("date", "==", date)
        .get()
        .then(pres => {
          pres.forEach(doc => {
            employee
              .where("id", "==", doc.data().eid)
              .get()
              .then(emp => {
                //console.log(res.data().name + " is presented today!")
                emp.forEach(res => {
                  this.items.push({
                    name: res.data().name,
                    position: res.data().position,
                    address: res.data().address,
                    date: doc.data().date
                  });
                });
              });
          });
        });
    },
    thisMonth(month) {
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      //monthly present

      let present = firestore().collection("present");
      let employee = firestore()
        .collection("employees")
        .get()
        .then(emp => {
          emp.forEach(doc => {
            let salary = parseInt(doc.data().salary) / 22;
            present
              .where("eid", "==", doc.data().id)
              .where("month", "==", month)
              .get()
              .then(res => {
                // console.log(
                //   doc.data().name + " =>> " + (salary * res.size).toFixed(2)
                // );
                let m = parseInt(month.toString().substring(0, 1)) - 1;
                this.mitems.push({
                  name: doc.data().name,
                  email: doc.data().email,
                  salary: (salary * res.size).toFixed(2),
                  date: month,
                  days: res.size
                });
              });
          });
        });
    },
    pickDate() {
      this.dialog = true;
    },
    getMonth() {
      this.dialog = false;
      this.mitems = [];
      this.thisMonth(this.date);
    },
    pickDaily() {
      this.dDialog = true;
    },
    getDay() {
      this.dDialog = false;
      this.items = [];
      this.getTodayAttend(this.day);
    }
  }
};
</script>
