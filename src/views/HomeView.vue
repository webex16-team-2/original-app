<template>
  <div class="home">
    <BaseBoard />
  </div>
</template>

<script>
// @ is an alias to /src
import BaseBoard from "@/components/BaseBoard.vue"

export default {
  name: "HomeView",
  components: {
    BaseBoard,
  },
}
</script>
