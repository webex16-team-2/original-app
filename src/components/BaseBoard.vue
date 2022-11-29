<template>
  <head>
    <title>オセロ de クイズ</title>
  </head>
  <body>
    <div class="board">
      <!-- 盤 -->
      <div id="stage" class="stage"></div>
      <!-- 各マス(とマスの枠線)を描画するためのテンプレート
    このテンプレートをクローンするfor文をmethodsに設定-->
      <div id="square-template" class="square">
        <div class="stone"></div>
      </div>
    </div>
  </body>
</template>

<script>
export default {
  data: function () {
    return {}
  },
  methods: {
    //onloadでページ読み込み時に関数を実行
    window: (onload = function () {
      const stage = document.getElementById("stage")
      const squareTemplate = document.getElementById("square-template")
      for (let i = 1; i < 65; i++) {
        //テンプレートから要素をクローン
        const square = squareTemplate.cloneNode(true)
        //テンプレート用のid属性を削除
        square.removeAttribute("id")
        //マス目のHTML要素を盤に追加
        stage.appendChild(square)

        const stone = square.querySelector(".stone")

        let defaultState
        /*iの値(左上のマスから1~64)によって
        デフォルトの石の状態(28,37が黒、29,36が白)にする*/
        if (i == 28 || i == 37) {
          defaultState = 1
        } else if (i == 29 || i == 36) {
          defaultState = 2
        } else {
          defaultState = 0
        }
        /*setAttributeで指定した要素(stone)にdata-stateという
        属性(マスの状態を表す、値は0か1か2)を設定する*/
        stone.setAttribute("data-state", defaultState)
      }
    }),
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
.board {
  margin: 0;
}

/*564(70×8+4)px四方のステージを設定*/
.stage {
  display: flex;
  flex-wrap: wrap;
  margin: auto;
  width: 564px;
  height: 564px;
  background-color: #008000;
}

/*下記の場合以外の要素は上と右が欠けた枠を書く */
.square {
  position: relative;
  width: 70px;
  height: 70px;
  border: solid black;
  border-width: 0 4px 4px 0;
  cursor: pointer;
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
/*石のスタイル */
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

#square-template {
  display: none;
}
</style>
