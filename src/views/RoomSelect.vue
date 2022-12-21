<template>
  <div class="roomtitle">Lobby</div>
  <div class="roombox">
    <button
      class="roombutton"
      v-for="n of 6"
      :key="n"
      :disabled="playernum[n - 1] >= 2"
    >
      <router-link
        to="/match"
        @click="joinRoom(n)"
        v-if="playernum[n - 1] < 2"
        style="text-decoration: none"
      >
        Room{{ n }}
      </router-link>
      <p v-else>Room{{ n }} Full</p>
      <p>{{ playernum[n - 1] }}/2</p>
    </button>
  </div>
</template>

<script>
import { ref, onValue, set } from "firebase/database"
import { db } from "@/firebase.js"

const roomRef = ref(db, "room")
const playernumRef = []
for (var i = 0; i < 6; i++) {
  playernumRef[i] = ref(db, "room/room" + (i + 1) + "/playerStatus/playernum")
}

export default {
  data: function () {
    return {
      playernum: new Array(6).fill(0),
      playercolor: 0,
      playername: "",
    }
  },
  methods: {
    joinRoom(n) {
      if (this.playernum[n - 1] === 0) {
        this.playercolor = 1
      } else if (this.playernum[n - 1] === 1) {
        this.playercolor = -1
      } else {
        return
      }
      const userInfo = {
        roomname: "room" + n,
        playername: this.playername,
        playercolor: this.playercolor,
      }
      localStorage.userInfo = JSON.stringify(userInfo)
      this.playernum[n - 1]++
      set(playernumRef[n - 1], this.playernum[n - 1]).then(() => {
        console.log("set playernum success")
        return
      })
    },
    checkRoom() {
      onValue(roomRef, (snapshot) => {
        var i = 0
        snapshot.forEach((childSnapshot) => {
          var childData = childSnapshot.val()
          this.playernum[i] = childData.playerStatus.playernum
          i++
        })
      })
    },
  },
  created: function () {
    this.checkRoom()
  },
}
</script>

<style scoped>
.roomtitle {
  font-family: "Zen Dots";
  font-style: normal;
  font-weight: 400;
  font-size: 64px;
  line-height: 77px;
  text-align: center;

  color: #000000;
}
.roombox {
  width: 900px;
  height: 700px;
  margin: auto;
  padding: 5%;
  display: flex;
  flex-wrap: wrap;
}
.roombutton {
  width: 265px;
  height: 247px;
  left: 144px;
  top: 319px;
  margin: auto;
  border-radius: 50%;
  background: #d9d9d9;
  font-size: 36px;
  font-weight: bold;
  color: #000000;
  font-family: "Zen Dots";
}
</style>
