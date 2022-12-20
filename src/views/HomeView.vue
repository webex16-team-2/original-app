<template>
  <div class="home">
    <div class="mainbox">
      <div class="maintitle">Quiz Othello</div>
      <div class="lobbybox">
        <router-link to="/lobby" class="lobbycolor">Lobby</router-link>
      </div>
    </div>
    <div class="rulebox">
      <router-link to="/rule" class="rulecolor"
        >? Rule of the Game
        <div><fa icon="fa-caret-down" /></div>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap");
#app {
  font-family: "Zen Dots", cursive;
}

.home {
  width: 100%;
}
.mainbox {
  width: 520px;
  height: 470px;
  margin: auto;
  padding: 5%;
  left: 360px;
  top: 198px;
  border-radius: 50%;
  background: #d9d9d9;
}
.maintitle {
  width: 100%;
  margin: auto;
  font-family: "Zen Dots", cursive;
  font-style: normal;
  font-weight: 400;
  font-size: 96px;
  line-height: 115px;
  text-align: center;

  color: #000000;
  overflow: hidden;
}
.lobbybox {
  width: 70%;
  margin: 10%;
  padding: 5%;
  border-radius: 50px;
  background: #000000;
}
.lobbycolor {
  font-family: "Zen Dots", cursive;
  font-style: normal;
  font-weight: 400;
  font-size: 48px;
  line-height: 58px;
  text-align: center;

  color: #ffffff;
}
.rulebox {
  width: 380px;
  height: 380px;
  margin: auto;
  padding: 3%;
}
.rulecolor {
  font-family: "Zen Dots", cursive;
  font-style: normal;
  font-weight: 400;
  font-size: 32px;
  line-height: 38px;
  text-align: center;
  color: #000000;
}
</style>
