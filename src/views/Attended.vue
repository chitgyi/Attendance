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
              <td>{{item.name}}</td>
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
    // this.getTodayAttend();
    this.thisMonth();
    this.getTodayAttend();
  },
  methods: {
    getTodayAttend() {
      let today = new Date();
      let month = today.getMonth() + "-" + today.getFullYear();
      let date = today.getDay() + "-" + month;
      let present = firebase.database().ref("Employee");
      firebase
        .database()
        .ref("Present")
        .child(month)
        .orderByChild("date")
        .equalTo(date)
        .once("value", snap => {
          snap.forEach(value => {
            //this.id.push(value.val().id);
            present
              .orderByChild("id")
              .equalTo(value.val().id)
              .limitToFirst(1)
              .once("value", employee => {
                employee.forEach(data => {
                  let item = {
                    name: data.val().name,
                    position: data.val().position,
                    address: data.val().address,
                    date: value.val().date
                  };
                  this.items.push(item);
                });
              });
          });
        });
    },
    thisMonth() {
      let present = firebase.database().ref("Present");
      firebase
        .database()
        .ref("Employee")
        .once("value", snap => {
          snap.forEach(value => {
            present
              .child("7-2019")
              .orderByChild("id")
              .equalTo(value.val().id)
              .once("value", data => {
                //console.log(value.val().name + " ==> "+ data.numChildren())
                let salary = parseInt(value.val().salary) / 30;
                this.mitems.push({
                  name: value.val().name,
                  email: value.val().email,
                  salary: salary * data.numChildren(),
                  date: "Auguest, 2019",
                  days: data.numChildren()
                });
              });
          });
        });
    }
  }
};
</script>
