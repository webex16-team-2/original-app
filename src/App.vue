<template>
  <Header />
  <router-view />
</template>
<script>
import Header from "@/components/HeaderBar"

export default {
  components: {
    Header,
  },
}
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Zen+Dots&display=swap");
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
