<template>
  <head>
    <title>オセロ de クイズ</title>
  </head>
  <body>
    <div class="boardStoneState">
      <div class="notification small" v-show="notice && playerColor === turn">
        <p v-if="end === false && start === true">My turn</p>
      </div>
      <div class="notification large" v-show="!start">
        <p>{{ message }}</p>
        <button v-if="gameMaster" @click="startGame" :disabled="!ready">
          Start
        </button>
        <button v-else @click="checkReady" :disabled="ready">Ready</button>
      </div>
      <div class="notification large" v-show="end">
        <p v-if="endFlag === 'othello'">
          Black: {{ black }} white: {{ white }}
        </p>
        <p v-else-if="endFlag === 'disconnect'">enemy disconnected</p>
        <p v-else-if="endFlag === 'quiz'">
          You answers are {{ answerIsCorrect ? "correct" : "wrong" }}
        </p>
        <p>{{ gameEnd() }}</p>
        <button @click="restartGame">restart</button>
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
      <div class="kaitou" v-if="end === false && answertheQuiz">
        <p>Note that if the answer is wrong, the opponent will get a turn.</p>
        <input
          class="form-text"
          type="text"
          v-for="n of 4"
          :key="n"
          v-model="answer[n - 1]"
          :placeholder="n + '問目の答え'"
        />
        <button :onClick="checkAnswer">Submit</button>
        <button v-on:click="answertheQuiz = false">Cancel</button>
      </div>
      <div class="notification small" v-show="answerIswromg">
        <p>Wrong answer</p>
      </div>
      <button
        :disabled="playerColor !== turn"
        v-on:click="answertheQuiz = true"
      >
        Answer the quiz
      </button>
    </div>
    <!-- <button @click="exitRoom">
      <RouterLink to="/">退室する</RouterLink>
    </button> -->
  </body>
</template>

<script>
import SquareC from "@/components/SquareC.vue"
import { db } from "@/firebase.js"
// select_quiz.jsの関数を追加でインポートする場合はここに
import quiz from "@/select_quiz.js"
import { ref, onValue, set } from "firebase/database"
import quizes from "../assets/quiz.json"

// ローカルストレージから情報を取得
let info = JSON.parse(localStorage.getItem("userInfo"))
const roomRef = ref(db, "room/" + info.roomname)
const BoardRef = ref(db, "room/" + info.roomname + "/boardinfo")
const endRef = ref(db, "room/" + info.roomname + "/boardinfo/end")
const endflagRef = ref(db, "room/" + info.roomname + "/boardinfo/endFlag")
const TurnRef = ref(db, "room/" + info.roomname + "/boardinfo/turn")
const PlayernumRef = ref(
  db,
  "room/" + info.roomname + "/playerStatus/playernum"
)
const Player1StatusRef = ref(
  db,
  "room/" + info.roomname + "/playerStatus/player1"
)
const Player2StatusRef = ref(
  db,
  "room/" + info.roomname + "/playerStatus/player2"
)
const PlayerStatusRef = ref(db, "room/" + info.roomname + "/playerStatus")
const quizRef = ref(db, "room/" + info.roomname + "/quiz")
const readyRef = ref(db, "room/" + info.roomname + "/ready")
const startRef = ref(db, "room/" + info.roomname + "/start")

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
  beforeRouteLeave(to, from, next) {
    if (this.confirm() === false) return
    else {
      this.exitRoom()
      next()
    }
  },
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
    onValue(startRef, (snapshot) => {
      this.start = snapshot.val()
      if (this.start) {
        onValue(quizRef, (snapshot) => {
          this.quiz = snapshot.val()

          if (this.quiz === "" && this.gameMaster) {
            // クイズを選択する
            this.quiz = quiz.quizFetch(quizes)
            // クイズをデータベースに保存する
            set(quizRef, this.quiz)
          }
          if (this.quiz !== "") this.quizText = quiz.quizSplit(this.quiz)
        })
        //BoardRefの値を監視 この時点で盤面の状態を取得
        this.GetBoardinfo()
        //ユーザーの状態を監視
        this.GetUserinfo()
      }
    })
  },
  mounted() {
    //ページを離れるときに退室する。退室ボタンもあるが、念のため
    // window.addEventListener("beforeunload", () => {
    //   this.exitRoom()
    // })
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
      playerNum: 0,
      //盤面の石の色を管理
      boardStoneState: new Array(64).fill(0),
      //盤面の状態を管理
      boardState: new Array(64).fill(0),
      //ターンを管理
      turn: 0,
      //クリックしたマスの番号を管理
      clickSquareNum: -1,
      //石の数を管理
      black: 0,
      white: 0,
      //ゲームが終了したかどうかを管理
      end: false,
      endFlag: "",
      //クイズのテキストを管理
      quizset: false,
      quizText: "",
      quiz: {},
      answertheQuiz: false,
      answerIswromg: false,
      answerIsCorrect: false,
      answer: new Array(4).fill(""),
      notice: false,
    }
  },
  methods: {
    confirm() {
      return window.confirm(
        "ルームから接続を切断することになりますが、よろしいでしょうか？"
      )
    },
    startGame() {
      this.start = true
      set(startRef, this.start)
    },
    checkReady() {
      this.ready = true
      set(readyRef, this.ready)
    },
    restartGame() {
      const initStatus = {
        name: this.roomName,
        playerStatus: {
          playernum: this.playerNum,
          player1: false,
          player2: false,
        },
        boardinfo: {
          boardStoneState: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, -1, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
          turn: 1,
          clickSquareNum: -1,
          endFlag: "",
          end: false,
        },
        gameMaster: "",
        quiz: "",
        start: false,
        ready: false,
      }
      set(roomRef, initStatus)
    },
    gameEnd() {
      //ゲーム終了時の処理
      //石の数を数える
      if (this.endFlag === "othello") {
        var black = 0
        var white = 0
        for (var i = 0; i < 64; i++) {
          if (this.boardStoneState[i] == BLACK) {
            black++
          } else if (this.boardStoneState[i] == -BLACK) {
            white++
          }
        }
        this.black = black
        this.white = white
        //勝敗を判定
        if (black === white) return "Draw"
        else if (black > white) {
          if (this.playerColor === 1) return "You Win"
          else return "You Lose"
        } else {
          if (this.playerColor === -1) return "You Win"
          else return "You Lose"
        }
      } else if (this.endFlag === "quiz") {
        if (this.answerIsCorrect) {
          return "You Win"
        } else return "You Lose"
      } else return "You Win"
    },
    //ゲーム終了時の処理
    exitRoom() {
      if (this.playerNum > 0) this.playerNum--
      set(PlayernumRef, this.playerNum)
      if (this.playerNum === 0) {
        this.restartGame()
      }
      if (this.playerColor === BLACK) {
        set(Player1StatusRef, true)
      } else {
        set(Player2StatusRef, true)
      }
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
          this.answerIsCorrect = true
          this.end = true
          set(endRef, this.end).then(() => {
            set(endflagRef, "quiz").then(() => {
              return
            })
          })
        } else {
          this.turn *= -1
          //通知をオンにする。2秒後にオフにする
          this.turnOnnotice("turn")
          this.turnOnnotice("answer")
          this.boardState = new Array(64).fill(0)
          set(TurnRef, this.turn)
        }
        this.answertheQuiz = false
        this.answer = new Array(4).fill("")
      }
    },
    //盤面の情報をfirebaseから取得する
    GetBoardinfo() {
      onValue(BoardRef, (snapshot) => {
        const data = snapshot.val()
        this.turn = data.turn
        this.turnOnnotice("turn")
        this.boardStoneState = data.boardStoneState
        this.clickSquareNum = data.clickSquareNum
        this.endFlag = data.endFlag
        this.end = data.end

        if (this.end) this.gameEnd()
        else if (this.turn === this.playerColor) {
          this.findMoves(this.turn, this.boardState)
          if (this.boardState.every((x) => x === 0)) {
            var enemy_boardState = new Array(64).fill(0)
            this.findMoves(this.turn * -1, enemy_boardState)
            if (enemy_boardState.every((x) => x === 0)) {
              set(endRef, true).then(
                set(endflagRef, "othello").then(() => {
                  this.end = true
                  this.endFlag = "othello"
                })
              )
            } else {
              this.turn *= -1
              this.turnOnnotice("turn")
              set(BoardRef, {
                boardStoneState: this.boardStoneState,
                clickSquareNum: this.clickSquareNum,
                turn: this.turn,
                end: this.end,
                endFlag: this.endFlag,
              })
            }
          }
        }
      })
    },
    GetUserinfo() {
      onValue(PlayerStatusRef, (snapshot) => {
        const data = snapshot.val()
        this.playerNum = data.playernum
        if (this.playerColor === BLACK) {
          if (data.player2) {
            set(endflagRef, "disconnect").then(() => {
              this.endFlag = "disconnect"
              set(endRef, true).then(() => {
                return
              })
            })
          }
        } else {
          if (data.player1) {
            set(endflagRef, "disconnect").then(() => {
              this.endFlag = "disconnect"
              set(endRef, true).then(() => {
                return
              })
            })
          }
        }
      })
    },
    //マスをクリックしたときの処理
    clickSquare(n) {
      //クリックしたマスが空白でなければ何もしない
      if (
        this.boardState[n] === 1 &&
        this.turn === this.playerColor &&
        this.start
      ) {
        //駒をひっくり返す
        this.turnOver(n)
        //交代
        this.turn *= -1
        //通知をオンにする。2秒後にオフにする
        this.turnOnnotice("turn")
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
          endFlag: this.endFlag,
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
    turnOnnotice(notice) {
      if (notice === "turn") {
        this.notice = true
        setTimeout(() => {
          this.notice = false
        }, 500)
      } else if (notice === "answer") {
        this.answerIswromg = true
        setTimeout(() => {
          this.answerIswromg = false
        }, 1000)
      }
    },
  },
  computed: {
    message: function () {
      if (this.gameMaster) {
        return "Please wait until your opponent is ready."
      } else {
        return "When you're ready, just push the button."
      }
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

.notification {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  z-index: 1;
  background: #000000;
  border: 10px solid #d9d9d9;
  box-shadow: 30px 30px 4px rgba(0, 0, 0, 0.25);
  border-radius: 50px;
}
.large {
  width: 788px;
  height: 226px;
}

.large > button {
  margin-top: 0;
}

.small {
  width: 300px;
  height: auto;
}
.notification > p {
  font-family: "Zen Dots";
  font-style: normal;
  font-weight: 400;
  font-size: 35px;
  color: #ffffff;
}

button {
  border-radius: 30px;
  background: #fcfcfc;
  color: rgb(0, 0, 0);
  border: 1px solid;
  position: relative;
  height: 60px;
  font-family: "Zen Dots";
  font-style: normal;
  font-size: 1.6em;
  padding: 0 2em;
  cursor: pointer;
  transition: 800ms ease all;
  outline: none;
  margin: 0.5em;
}

button:disabled {
  background: #808080;
  color: #fff;
  cursor: not-allowed;
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

.kaitou {
  background-color: #e0e0e0;
  position: absolute;
  padding-top: 20px;
  top: 10%;
  left: 10%;
  width: 20%;
  border-radius: 5%;
}

.kaitou > p {
  width: 80%;
  margin: auto;
  font-family: "Zen Dots";
  font-style: normal;
  font-size: 1em;
}

.kaitou > button {
  width: 80%;
  margin: 0.5em;
  font-size: large;
}

.form-text {
  height: 2.4em;
  width: 80%;
  margin: 16px 0 16px 0;
  padding: 0 16px;
  border-radius: 4px;
  border: none;
  box-shadow: 0 0 0 1px #ccc inset;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.form-text:focus {
  outline: 0;
  box-shadow: 0 0 0 2px rgb(33, 150, 243) inset;
}
/*下記の場合以外の要素は上と右が欠けた枠を書く */

#square-template {
  display: none;
}
</style>
