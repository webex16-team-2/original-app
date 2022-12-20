<template>
  <header class="header">
    <nav class="navigation">
      <router-link
        to="/"
        class="navigation__link"
        exact-active-class="navigation__link--exact-active"
        ><fa icon="house" />Top</router-link
      >
      |
      <router-link
        to="/lobby"
        class="navigation__link"
        exact-active-class="navigation__link--exact-active"
        ><fa icon="fa-solid fa-chess-board" />&nbsp;lobby</router-link
      >|
      <router-link
        to="/rule"
        class="navigation__link"
        exact-active-class="navigation__link--exact-active"
        ><fa icon="fa-solid fa-circle-question" />rule</router-link
      >|
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 2rem;
}

.header__titles {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navigation {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 0.8rem;
  font-size: 1.5rem;
}

.navigation__link {
  font-weight: bold;
  color: #000000;
  font-family: "Zen Dots";
}

.navigation__link--exact-active {
  color: #04d2ff;
}
</style>
