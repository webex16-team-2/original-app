<template>
  <div class="square" :data-state="`${lastClicked}`">
    <div class="suggest" v-if="SquareState === 1"></div>
    <div class="stone" :data-state="`${StoneState}`">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ["SquareState", "StoneState", "lastClicked"],
}
</script>

<style scoped>
.square {
  position: relative;
  width: 70px;
  height: 70px;
  border: solid black;
  border-width: 0 4px 4px 0;
}

/*2~8番目の要素は左が欠けた枠を書く*/
.square:nth-child(-n + 8) {
  border-width: 4px 4px 4px 0;
  height: 74px;
}

/*8n+1(各行1)番目の要素は上が欠けた枠を書く*/
.square:nth-child(8n + 1) {
  border-width: 0 4px 4px 4px;
  width: 74px;
}

/*1番目の要素は四角の枠を書く*/
.square:first-child {
  border-width: 4px;
  width: 74px;
  height: 74px;
}

.square[data-state="1"] {
  background-color: #4b4b4b;
}
.suggest {
  position: absolute;
  top: 23px;
  left: 23px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(228, 10, 75, 0.5);
}

/* .square[data-state="1"] {
  background-color: green;
  border-radius: 50%;
} */

.stone {
  position: absolute;
  top: 1.4px;
  bottom: 0;
  left: 1.2px;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  font-size: 54px;
  font-weight: 600;
  text-align: center;
  line-height: 70px;
}
/*マスのデータの状態(0が空、1が黒、2が白)*/
.stone[data-state="0"] {
  display: none;
}

.stone[data-state="1"] {
  background-color: black;
  color: white;
}

.stone[data-state="-1"] {
  background-color: white;
  color: black;
}
</style>
