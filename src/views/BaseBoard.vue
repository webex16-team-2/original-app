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
          :lastClicked="lastClickedIndex(n)"
          @click="clickSquare(n)"
        >
          <div class="quiz" v-if="m === playerColor">
            <quizTextSplit.charAt(n) />
          </div>
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
import { quizTextSplit, quizFetch, quizSplit } from "@/select_quiz.js"
import { ref, onValue, set } from "firebase/database"

const BoardRef = ref(db, "room/room1/boardinfo")
const PlayernumRef = ref(db, "room/room1/playernum")
// 盤面の状態を管理するための変数宣言
// const initBoardStoneStatus = [
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 1, -1, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
// ]
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
    // ローカルストレージから情報を取得
    let info = JSON.parse(localStorage.getItem("userInfo"))
    this.roomName = info.roomname
    this.playerName = info.playername
    this.playerColor = info.playercolor
    //BoardRefの値を監視 この時点で盤面の状態を取得
    this.GetBoardinfo()
  },
  mounted() {
    //ページを離れるときに退室する。退室ボタンもあるが、念のため
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
      //クリックしたマスの番号を管理
      clickSquareNum: -1,
      //ゲームが終了したかどうかを管理
      end: false,
      winner: "",
      black: 0,
      white: 0,
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
      this.balck = black
      this.white = white
      this.winner = black > white ? "黒" : "白"
    },
    //マスをクリックしたときの処理
    clickSquare(n) {
      //クリックしたマスが空白でなければ何もしない
      if (this.boardState[n] === 1 && this.turn === this.playerColor) {
        //駒をひっくり返す
        this.turnOver(n)
        //交代
        this.turn *= -1
        //クリックした場所を更新
        this.clickSquareNum = n
        //盤面の状態を初期化
        for (let i = 0; i < 64; i++) {
          this.boardState[i] = 0
        }
        //データベースに反映
        set(BoardRef, {
          boardStoneState: this.boardStoneState,
          clickSquareNum: this.clickSquareNum,
          turn: this.turn,
          end: this.end,
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
    //おけるマスを探す。indexは現在のマスの番号、colorは現在のマスの色、boardStateは盤面の状態、directionは方向
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
    //盤面の情報をfirebaseから取得する
    GetBoardinfo() {
      onValue(BoardRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.key === "turn") this.turn = childSnapshot.val()
          else if (childSnapshot.key === "boardStoneState")
            this.boardStoneState = childSnapshot.val()
          else if (childSnapshot.key === "clickSquareNum")
            this.clickSquareNum = childSnapshot.val()
          else if (childSnapshot.key === "end") this.end = childSnapshot.val()
        })
        if (this.end) this.gameEnd()
        else if (this.turn === this.playerColor) {
          this.findMoves(this.turn, this.boardState)
          if (this.boardState.every((x) => x === 0)) {
            var enemy_boardState = new Array(64).fill(0)
            this.findMoves(this.turn * -1, enemy_boardState)
            if (enemy_boardState.every((x) => x === 0)) {
              const endRef = ref(db, "room/room1/boardinfo/end")
              set(endRef, true)
            } else {
              this.turn *= -1
              set(BoardRef, {
                boardStoneState: this.boardStoneState,
                clickSquareNum: this.clickSquareNum,
                turn: this.turn,
                end: this.end,
              })
            }
          }
        }
      })
    },
    //ゲーム終了時の処理
    exitRoom() {
      let playerNum
      onValue(PlayernumRef, (snapshot) => {
        playerNum = snapshot.val()
      })
      if (playerNum > 0) playerNum--
      set(PlayernumRef, playerNum)
    },
    lastClickedIndex(n) {
      if (n === this.clickSquareNum) return 1
      else return 0
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
