<template>
  <div class="square" :data-state="`${SquareState}`">
    <div class="stone" :data-state="`${StoneState}`"></div>
  </div>
</template>

<script>
export default {
  props: ["SquareState", "StoneState"],
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
  background-color: #424242;
}

.stone {
  position: absolute;
  top: 1.4px;
  bottom: 0;
  left: 1.2px;
  width: 64px;
  height: 64px;
  border-radius: 32px;
}
/*マスのデータの状態(0が空、1が黒、2が白)*/
.stone[data-state="0"] {
  display: none;
}

.stone[data-state="1"] {
  background-color: black;
}

.stone[data-state="2"] {
  background-color: white;
}
</style>
