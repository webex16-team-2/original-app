<template>
  <head>
    <title>オセロ de クイズ</title>
  </head>
  <body>
    <div class="boardStoneState">
      <div class="startgame" v-show="!start">
        相手プレーヤが準備するまで待ってください
        <button v-if="gameMaster" @click="startGame" :disabled="!ready">
          開始する
        </button>
        <button v-else @click="checkReady" :disabled="ready">Ready</button>
      </div>

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
            {{ quizText[n] }}
          </div>
        </SquareC>
      </div>
    </div>
    <div v-if="playerColor === turn && end === false">自分の番です</div>
    <div class="kaitou" v-if="end === false">
      <input type="text" v-for="n of 4" :key="n" v-model="answer[n - 1]" />
      <button :onClick="checkAnswer" :disabled="playerColor !== turn">
        これで提出する
      </button>
    </div>
    <button @click="exitRoom">
      <RouterLink to="/">退室する</RouterLink>
    </button>
  </body>
</template>

<script>
import SquareC from "@/components/SquareC.vue"
import { db } from "@/firebase.js"
// select_quiz.jsの関数を追加でインポートする場合はここに
import { randomQuiz, quizSplit } from "@/select_quiz.js"
import { ref, onValue, set } from "firebase/database"

const roomRef = ref(db, "room/room1")
const BoardRef = ref(db, "room/room1/boardinfo")
const TurnRef = ref(db, "room/room1/boardinfo/turn")
const PlayernumRef = ref(db, "room/room1/playernum")
const quizRef = ref(db, "room/room1/quiz")
const quizsetRef = ref(db, "room/room1/quizset")
const readyRef = ref(db, "room/room1/ready")
const startRef = ref(db, "room/room1/start")

const initStatus = {
  name: "room1",
  playernum: 2,
  player1: "",
  player2: "",
  boardinfo: {
    boardStoneState: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 1, -1, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    turn: 1,
    clickSquareNum: -1,
    end: false,
  },
  gameMaster: "",
  quiz: "",
  quizset: false,
  start: false,
  ready: false,
}

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
    this.gameMaster = this.playerColor === 1 ? true : false
    onValue(readyRef, (snapshot) => {
      this.ready = snapshot.val()
    })
    onValue(quizsetRef, (snapshot) => {
      this.quizset = snapshot.val()
    })
    onValue(startRef, (snapshot) => {
      this.start = snapshot.val()
      if (this.start) {
        onValue(quizRef, (snapshot) => {
          this.quiz = snapshot.val()
          if (!this.quizset && this.gameMaster) {
            // クイズを選択する
            this.quiz = randomQuiz
            // クイズをデータベースに保存する
            set(quizRef, this.quiz)
            set(quizsetRef, true)
          }
          this.quizText = quizSplit(this.quiz)
        })
        //BoardRefの値を監視 この時点で盤面の状態を取得
        this.GetBoardinfo()
      }
    })
  },
  mounted() {
    //ページを離れるときに退室する。退室ボタンもあるが、念のため
    window.addEventListener("beforeunload", () => {
      console.log("退室しました")
      this.exitRoom()
    })
  },
  data: function () {
    return {
      //ゲームマスター
      gameMaster: false,
      //プレーヤー2がReadyしたかどうかを管理
      ready: false,
      //プレーヤー1がスタートしたいかどうかを管理
      start: false,
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
      //クイズのテキストを管理
      quizset: false,
      quizText: "",
      quiz: {},
      answer: new Array(4).fill(""),
    }
  },
  methods: {
    startGame() {
      this.start = true
      set(startRef, this.start)
    },
    checkReady() {
      this.ready = true
      set(readyRef, this.ready)
    },
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
      set(roomRef, initStatus)
    },
    //ゲーム終了時の処理
    exitRoom() {
      let playerNum
      onValue(PlayernumRef, (snapshot) => {
        playerNum = snapshot.val()
      })
      if (playerNum > 0) playerNum--
      if (playerNum === 0) {
        set(roomRef, initStatus)
        set(PlayernumRef, 0)
      } else set(PlayernumRef, playerNum)
    },
    //入力したクイズの答えをチェックする
    checkAnswer() {
      if (this.turn === this.playerColor) {
        if (
          this.answer[0] === this.quiz[0].answer &&
          this.answer[1] === this.quiz[1].answer &&
          this.answer[2] === this.quiz[2].answer &&
          this.answer[3] === this.quiz[3].answer
        ) {
          console.log("正解")
        } else {
          this.turn *= -1
          this.boardState = new Array(64).fill(0)
          set(TurnRef, this.turn)
        }
        this.answer = new Array(4).fill("")
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
  position: relative;
  margin: 0;
}

.startgame {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  z-index: 1;
  background-color: #e70489;
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
