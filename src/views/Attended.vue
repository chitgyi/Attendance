<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout justify-center wrap>
      <v-flex md12>
        <material-card
          color="blue"
          flat
          full-width
          title="Today Attended Employees"
          text="List of employees"
        >
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
        </material-card>
      </v-flex>
      <v-flex md12>
        <material-card
          color="blue"
          flat
          full-width
          title="This Month Attended Employees"
          text="List of employees"
        >
          <v-data-table :headers="mheaders" :items="mitems" hide-actions>
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
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import firebase, { firestore } from "firebase";
export default {
  data: () => ({
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
    let month = today.getMonth() + 1 + "-" + today.getFullYear();
    let date = today.getDate() + "-" + month;
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
                let m = parseInt(month.toString().substring(0,1))-1
                this.mitems.push({
                  name: doc.data().name,
                  email: doc.data().email,
                  salary: (salary * res.size).toFixed(2),
                  date: months[m] + ", " + new Date().getFullYear(),
                  days: res.size
                });
              });
          });
        });
    }
  }
};
</script>
