<template>
  <div class="home">
    <RoomSelect />
  </div>
</template>

<script>
// @ is an alias to /src
import RoomSelect from "@/views/RoomSelect.vue"

export default {
  name: "HomeView",
  components: {
    RoomSelect,
  },
}
</script>
