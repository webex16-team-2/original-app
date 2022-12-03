<template>
  <head>
    <title>オセロ de クイズ</title>
  </head>
  <body>
    <div class="board">
      <!-- 盤 -->
      <div id="stage" class="stage">
        <!-- 各マス(とマスの枠線)を描画するためのテンプレート
    このテンプレートをクローンするfor文をmethodsに設定-->
        <SquareC
          v-for="(m, n) in board"
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
  </body>
</template>

<script>
import SquareC from "@/components/SquareC.vue"

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
      color: 1,
      board: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      boardState: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    }
  },
  methods: {
    clickSquare(n) {
      if (this.boardState[n] === 1) {
        this.turnOver(n)
        this.color = this.color === 1 ? 2 : 1
        this.findMoves(this.color)
      }
    },
    turnOver(n) {
      for (let d of direction) {
        console.log(d)
        let turnOverList = []
        let x = Math.floor(n / 8)
        let y = n % 8
        turnOverList.push(n)
        let count = 0
        x += d[0]
        y += d[1]
        while (!(x < 0 || x > 7 || y < 0 || y > 7)) {
          if (
            this.board[x * 8 + y] !== this.color &&
            this.board[x * 8 + y] !== 0
          ) {
            count += 1
            turnOverList.push(x * 8 + y)
          } else break
          x += d[0]
          y += d[1]
        }
        if (count > 0 && this.board[x * 8 + y] === this.color) {
          turnOverList.push(x * 8 + y)

          for (let i = 0; i < turnOverList.length; i++) {
            this.board[turnOverList[i]] = this.color
          }
          for (let i = 0; i < 64; i++) {
            this.boardState[i] = 0
          }
        }
      }
    },
    checkDeployable(index, color, d) {
      let di = d[0]
      let dj = d[1]
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
        this.board[i * 8 + j] !== 0 &&
        this.board[i * 8 + j] !== color
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
        this.board[i * 8 + j] === 0 &&
        count > 0
      ) {
        this.boardState[i * 8 + j] = 1
      }
    },
    findMoves(color) {
      for (let i = 0; i < 64; i++) {
        if (this.board[i] === color) {
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

#square-template {
  display: none;
}
</style>
