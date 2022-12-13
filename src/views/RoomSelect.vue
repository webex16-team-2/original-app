<template>
  <button v-if="playerFull === false">
    <router-link to="/match" @click="joinRoom"> ルーム1に入る </router-link>
  </button>
  <button v-else disabled>満員です</button>
</template>

<script>
import { ref, onValue, set } from "firebase/database"
import { db } from "@/firebase.js"

export default {
  data: function () {
    return {
      playernum: 0,
      playercolor: 0,
      roomname: "",
      playername: "",
    }
  },
  methods: {
    joinRoom() {
      if (this.playernum === 0) {
        this.playercolor = 1
      } else if (this.playernum === 1) {
        this.playercolor = -1
      }
      const userInfo = {
        roomname: this.roomname,
        playername: this.playername,
        playercolor: this.playercolor,
      }
      localStorage.userInfo = JSON.stringify(userInfo)
      this.playernum++
      set(ref(db, "room/room1/playernum"), this.playernum)
    },
    checkRoom() {
      const playersNumRef = ref(db, "room/room1/playernum")
      onValue(playersNumRef, (snapshot) => {
        this.playernum = snapshot.val()
      })
    },
    queryPlayerName() {
      let Ref
      if (this.playernum === 0) {
        Ref = ref(db, "room/room1/player1")
      } else if (this.playernum === 1) {
        Ref = ref(db, "room/room1/player2")
      }
      onValue(Ref, (snapshot) => {
        this.playername = snapshot.val()
      })
    },
    queryRoomName() {
      const roomnameRef = ref(db, "room/room1/roomname")
      onValue(roomnameRef, (snapshot) => {
        this.roomname = snapshot.val()
      })
    },
  },
  computed: {
    playerFull: function () {
      this.checkRoom()
      if (this.playernum === 2) {
        return true
      } else {
        return false
      }
    },
  },

  created: function () {
    this.queryRoomName()
    this.queryPlayerName()
  },
}
</script>

<style scoped></style>
