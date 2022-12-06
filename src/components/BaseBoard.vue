<template>
  <head>
    <title>オセロ de クイズ</title>
  </head>
  <body>
    <div class="boardStoneState">
      <!-- 盤 -->
      <div id="stage" class="stage">
        <!-- 各マス(とマスの枠線)を描画するためのテンプレート
    このテンプレートをクローンするfor文をmethodsに設定-->
        <SquareC
          v-for="(m, n) in boardStoneState"
          :key="n"
          :SquareState="boardState[n]"
          :StoneState="m"
          @click="clickSquare(n)"
        >
        </SquareC>
        <!-- <div id="square-template" class="square">
        <div class="stone"></div> -->
      </div>
    </div>
    <div v-if="color === 1">黒の番です</div>
    <div v-else>白の番です</div>
  </body>
</template>

<script>
import SquareC from "@/components/SquareC.vue"

// 盤面の状態を管理するための変数宣言
const BLACK = 1
const EMPTY = 0
const ERROR = -1

// 方向を表すイテラブルなオブジェクト
var direction = {
  [Symbol.iterator]: function* () {
    yield [-1, -1]
    yield [-1, 0]
    yield [-1, 1]
    yield [0, -1]
    yield [0, 1]
    yield [1, -1]
    yield [1, 0]
    yield [1, 1]
  },
}

export default {
  data: function () {
    return {
      //プレーヤーを管理
      color: BLACK,
      //盤面の石の色を管理
      boardStoneState: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 1, -1, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      //盤面の状態を管理
      boardState: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    }
  },
  methods: {
    gameEnd() {
      //ゲーム終了時の処理
      //石の数を数える
      var black = 0
      var white = 0
      for (var i = 0; i < 64; i++) {
        if (this.boardStoneState[i] == BLACK) {
          black++
        } else if (this.boardStoneState[i] == -BLACK) {
          white++
        }
      }
      //結果を表示
      if (black > white) {
        alert(
          "黒" +
            black.toString() +
            "\n" +
            "白" +
            white.toString() +
            "\n" +
            "黒の勝ち"
        )
      } else if (black < white) {
        alert(
          "黒" +
            black.toString() +
            "\n" +
            "白" +
            white.toString() +
            "\n" +
            "白の勝ち"
        )
      } else {
        alert("引き分け")
      }
    },
    //マスをクリックしたときの処理
    clickSquare(n) {
      //クリックしたマスが空白でなければ何もしない
      if (this.boardState[n] === 1) {
        //駒をひっくり返す
        this.turnOver(n)
        //次のプレーヤーに変更
        this.color = this.color * -1
        //盤面の状態を更新
        this.findMoves(this.color)
        //ゲーム終了 or パス判定
        if (this.boardStoneState.every((v) => v === 1 || v === -1)) {
          this.gameEnd()
        } else if (this.boardState.every((v) => v === 0)) {
          alert("おけないので、パス")
          this.color *= -1
          this.findMoves(this.color)
          if (this.boardState.every((v) => v === 0)) this.gameEnd()
        }
      }
    },
    //indexは現在のマスの番号、colorは現在のマスの色、purposeは探そうとしている色、directionは方向
    CheckDirection(index, color, purpose, direction) {
      const di = direction[0]
      const dj = direction[1]
      let i = Math.floor(index / 8)
      let j = index % 8
      let count = 0

      i += di
      j += dj

      while (
        i >= 0 &&
        i <= 7 &&
        j >= 0 &&
        j <= 7 &&
        this.boardStoneState[i * 8 + j] === color * -1
      ) {
        i += di
        j += dj
        count += 1
      }
      if (
        i >= 0 &&
        i <= 7 &&
        j >= 0 &&
        j <= 7 &&
        this.boardStoneState[i * 8 + j] === purpose &&
        count > 0
      ) {
        return i * 8 + j
      } else return ERROR
    },
    turnOver(ClickedIndex) {
      //クリックしたマスの周りのマスを調べる
      for (let d of direction) {
        const SearchedIndex = this.CheckDirection(
          ClickedIndex,
          this.color,
          this.color,
          d
        )
        //もし、CheckDirectionがエラーを返さなければ,その方向はひっくり返せる
        let TempIndex = ClickedIndex
        if (SearchedIndex !== ERROR) {
          const di = d[0]
          const dj = d[1]
          this.boardStoneState[TempIndex] = this.color
          while (TempIndex !== SearchedIndex) {
            TempIndex += di * 8 + dj
            this.boardStoneState[TempIndex] = this.color
          }
        }
      }
      //盤面の状態を初期化
      for (let i = 0; i < 64; i++) {
        this.boardState[i] = 0
      }
    },
    checkDeployable(index, color, direction) {
      //目的をEMPTYにすることで、その方向に駒が置けるかどうかを調べる
      const mapIndex = this.CheckDirection(index, color, EMPTY, direction)
      if (mapIndex !== ERROR) {
        this.boardState[mapIndex] = 1
      }
    },
    //おけるマスを探す
    findMoves(color) {
      for (let i = 0; i < 64; i++) {
        if (this.boardStoneState[i] === color) {
          for (let d of direction) {
            this.checkDeployable(i, color, d)
          }
        }
      }
    },
  },

  computed: {
    // 盤の状態を取得
  },
  created: function () {
    // 盤の状態を初期化
    this.findMoves(this.color)
  },
  components: { SquareC },
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
.boardStoneState {
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

#square-template {
  display: none;
}
</style>
