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
            {{ quizTextSplit[n] }}
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
    //クイズ初期化
    let l = this.quiz.length
    const a = this.quiz.concat()
    let n = Math.min(4, l)
    while (n-- > 0) {
      var i = Math.floor(Math.random() * l)
      this.randomQuiz.push(a[i])
      a[i] = a[--l]
    }
    this.quizText =
      this.randomQuiz[0] +
      this.randomQuiz[1] +
      this.randomQuiz[2] +
      this.randomQuiz[3]
    const regex = /.{1,4}/g
    const result = this.quizText.match(regex)
    //文字列を左上、左下、右上、右下のセクションごとに表示するように整形
    let quizSplitArray = []
    /*クイズノック準拠の並びの場合のコード
    使う場合は↑の/.{1,4}/gを/.{1,1}/gにする。
    quizSplitArray[0] = result[0]
    quizSplitArray[1] = result[1]
    quizSplitArray[2] = result[2]
    quizSplitArray[3] = result[3]
    quizSplitArray[4] = result[19]
    quizSplitArray[5] = result[18]
    quizSplitArray[6] = result[17]
    quizSplitArray[7] = result[16]
    quizSplitArray[8] = result[4]
    quizSplitArray[9] = result[5]
    quizSplitArray[10] = result[6]
    quizSplitArray[11] = result[7]
    quizSplitArray[12] = result[23]
    quizSplitArray[13] = result[22]
    quizSplitArray[14] = result[21]
    quizSplitArray[15] = result[20]
    quizSplitArray[16] = result[8]
    quizSplitArray[17] = result[9]
    quizSplitArray[18] = result[10]
    quizSplitArray[19] = result[11]
    quizSplitArray[20] = result[27]
    quizSplitArray[21] = result[26]
    quizSplitArray[22] = result[25]
    quizSplitArray[23] = result[24]
    quizSplitArray[24] = result[12]
    quizSplitArray[25] = result[13]
    quizSplitArray[26] = result[14]
    quizSplitArray[27] = result[15]
    quizSplitArray[28] = result[31]
    quizSplitArray[29] = result[30]
    quizSplitArray[30] = result[29]
    quizSplitArray[31] = result[28]
    quizSplitArray[32] = result[44]
    quizSplitArray[33] = result[45]
    quizSplitArray[34] = result[46]
    quizSplitArray[35] = result[47]
    quizSplitArray[36] = result[63]
    quizSplitArray[37] = result[62]
    quizSplitArray[38] = result[61]
    quizSplitArray[39] = result[60]
    quizSplitArray[40] = result[40]
    quizSplitArray[41] = result[41]
    quizSplitArray[42] = result[42]
    quizSplitArray[43] = result[43]
    quizSplitArray[44] = result[59]
    quizSplitArray[45] = result[58]
    quizSplitArray[46] = result[57]
    quizSplitArray[47] = result[56]
    quizSplitArray[48] = result[36]
    quizSplitArray[49] = result[37]
    quizSplitArray[50] = result[38]
    quizSplitArray[51] = result[39]
    quizSplitArray[52] = result[55]
    quizSplitArray[53] = result[54]
    quizSplitArray[54] = result[53]
    quizSplitArray[55] = result[52]
    quizSplitArray[56] = result[32]
    quizSplitArray[57] = result[33]
    quizSplitArray[58] = result[34]
    quizSplitArray[59] = result[35]
    quizSplitArray[60] = result[51]
    quizSplitArray[61] = result[50]
    quizSplitArray[62] = result[49]
    quizSplitArray[63] = result[48]
    */
    //全て左上から読めるように統一した場合のコード
    for (let i = 0; i < 16; i++) {
      if (i % 2 == 0) {
        quizSplitArray[i] = result[i / 2]
      } else if (i % 2 !== 0) {
        quizSplitArray[i] = result[0.5 * i + 7.5]
      }
    }
    this.quizTextSplit = quizSplitArray.join("")
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
      //クイズのテキストを管理
      quiz: [
        "二重丸で表される地図記号とは何？",
        "現在のオーストリアの首都はどこ？",
        "WHOと略する組織の正式名称は？",
        "サッカーW杯2018の優勝国は？",
        "七五三、全部足すといくつになる？",
        "カナダとアメリカ、どっちが広い？",
        "楕円形の世界地図、図法の名前は？",
        "世界で最も面積が小さい国はどこ？",
        "地図上で起伏を表す線の名前は何？",
        "青森県弘前市、弘前の読み方は何？",
        "もう約分できない分数、何という？",
        "円周と直径の比のことを何という？",
        "２の３乗と３の２乗。大きいのは？",
        "面の数が最大の正多面体の名前は？",
        "累乗を表す右上に書く数の名前は？",
        "本名は夏目金之助。この作家は誰？",
        "芸人で芥川賞受賞。この作家は誰？",
        "日本初のノーベル文学賞受賞者は？",
        "唯一のカ行変格活用の動詞とは何？",
        "歳徳神がいる方角を指す言葉は何？",
      ],
      answer: [
        "しやくしょ",
        "うぃーん",
        "せかいほけんきかん",
        "ふらんす",
        "じゅうご",
        "かなだ",
        "もるわいで",
        "ばちかんしこく",
        "とうこうせん",
        "ひろさき",
        "きやくぶんすう",
        "えんしゅうりつ",
        "さんのにじょう",
        "せいにじゅうめんたい",
        "しすう",
        "なつめそうせき",
        "またよしなおき",
        "かわばたやすなり",
        "くる",
        "えほう",
      ],
      /*クイズを4つランダムに取り出した配列(randomQuiz)と
      クイズの文章を4つを結合したもの(quizText)と、
      それを表示用に整列させたもの(quizTextSplit)*/
      randomQuiz: [],
      quizText: "",
      quizTextSplit: "",
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
