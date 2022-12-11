<template>
  <head>
    <title>オセロ de クイズ</title>
  </head>
  <body>
    <div class="boardStoneState">
      <!-- 盤 -->
      <div id="stage" class="stage">
        <SquareC
          v-for="(m, n) in boardStoneState"
          :key="n"
          :SquareState="boardState[n]"
          :StoneState="m"
          @click="clickSquare(n)"
        >
        </SquareC>
      </div>
    </div>
    <div v-if="playerColor === turn">自分の番です</div>
    <button @click="exitRoom">
      <RouterLink to="/">退室する</RouterLink>
    </button>
  </body>
</template>

<script>
import SquareC from "@/components/SquareC.vue"
import { db } from "@/firebase.js"
import { ref, onValue, set } from "firebase/database"

const BoardRef = ref(db, "room/room1/boardinfo")
const PlayernumRef = ref(db, "room/room1/playernum")
// 盤面の状態を管理するための変数宣言
const initBoardStoneStatus = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, -1, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]
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
  created() {
    console.log("created")
    let info = JSON.parse(localStorage.getItem("userInfo"))
    this.roomName = info.roomname
    this.playerName = info.playername
    this.playerColor = info.playercolor
    this.GetBoardinfo()
  },
  mounted() {
    window.addEventListener("beforeunload", () => {
      this.exitRoom()
    })
  },
  data: function () {
    return {
      //プレイヤーの色を管理
      playerColor: 0,
      //部屋の名前
      roomName: "",
      //プレイヤーの名前
      playerName: "",
      //盤面の石の色を管理
      boardStoneState: new Array(64).fill(0),
      //盤面の状態を管理
      boardState: new Array(64).fill(0),
      //ターンを管理
      turn: 0,
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
      set(BoardRef, { boardStoneState: initBoardStoneStatus, turn: BLACK })
    },
    //マスをクリックしたときの処理
    clickSquare(n) {
      //クリックしたマスが空白でなければ何もしない
      if (this.boardState[n] === 1 && this.turn === this.playerColor) {
        //駒をひっくり返す
        this.turnOver(n)
        //交代
        this.turn *= -1
        //データベースに反映
        set(BoardRef, {
          boardStoneState: this.boardStoneState,
          turn: this.turn,
        })
      }
    },
    //indexは現在のマスの番号、colorは現在のマスの色、purposeは探そうとしている色、directionは方向
    CheckDirection(index, playerColor, purpose, direction) {
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
        this.boardStoneState[i * 8 + j] === playerColor * -1
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
          this.playerColor,
          this.playerColor,
          d
        )
        //もし、CheckDirectionがエラーを返さなければ,その方向はひっくり返せる
        let TempIndex = ClickedIndex
        if (SearchedIndex !== ERROR) {
          const di = d[0]
          const dj = d[1]
          this.boardStoneState[TempIndex] = this.playerColor
          while (TempIndex !== SearchedIndex) {
            TempIndex += di * 8 + dj
            this.boardStoneState[TempIndex] = this.playerColor
          }
        }
      }
    },
    checkDeployable(index, playerColor, boardState, direction) {
      //目的をEMPTYにすることで、その方向に駒が置けるかどうかを調べる
      const mapIndex = this.CheckDirection(index, playerColor, EMPTY, direction)
      if (mapIndex !== ERROR) {
        boardState[mapIndex] = 1
      }
    },
    //おけるマスを探す
    findMoves(playerColor, boardState) {
      for (let i = 0; i < 64; i++) {
        if (this.boardStoneState[i] === playerColor) {
          for (let d of direction) {
            this.checkDeployable(i, playerColor, boardState, d)
          }
        }
      }
    },

    GetBoardinfo() {
      onValue(BoardRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.key === "turn") this.turn = childSnapshot.val()
          else if (childSnapshot.key === "boardStoneState")
            this.boardStoneState = childSnapshot.val()
        })
        for (let i = 0; i < 64; i++) {
          this.boardState[i] = 0
        }
        this.findMoves(this.turn, this.boardState)
        if (this.boardState.every((value) => value === 0)) {
          let enemy = Array(64).fill(0)
          this.findMoves(this.playerColor * -1, enemy)
          if (enemy.every((value) => value === 0)) {
            this.gameEnd()
          } else {
            this.turn *= -1
            set(BoardRef, {
              boardStoneState: this.boardStoneState,
              turn: this.turn,
            })
          }
        }
      })
    },
    exitRoom() {
      let playerNum
      onValue(PlayernumRef, (snapshot) => {
        playerNum = snapshot.val()
      })
      if (playerNum > 0) playerNum--
      set(PlayernumRef, playerNum)
    },
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
