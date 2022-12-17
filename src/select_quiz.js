let quizzes = [
  {
    question: "二重丸で表される地図記号とは何？",
    answer: "しやくしょ",
  },
  {
    question: "現在のオーストリアの首都はどこ？",
    answer: "うぃーん",
  },
  {
    question: "WHOと略する組織の正式名称は？",
    answer: "せかいほけんきかん",
  },
  {
    question: "サッカーW杯2018の優勝国は？",
    answer: "ふらんす",
  },
  {
    question: "七五三、全て足すといくつになる？",
    answer: "じゅうご",
  },
  {
    question: "カナダとアメリカ、どっちが広い？",
    answer: "かなだ",
  },
  {
    question: "楕円形の世界地図、図法の名前は？",
    answer: "もるわいで",
  },
  {
    question: "世界で最も面積が小さい国はどこ？",
    answer: "ばちかんしこく",
  },
  {
    question: "地図上で起伏を表す線の名前は何？",
    answer: "とうこうせん",
  },
  {
    question: "青森県弘前市、弘前の読み方は何？",
    answer: "ひろさき",
  },
  {
    question: "もう約分できない分数、何という？",
    answer: "きやくぶんすう",
  },
  {
    question: "円周と直径の比のことを何という？",
    answer: "えんしゅうりつ",
  },
  {
    question: "正の整数のことを、特に何という？",
    answer: "しぜんすう",
  },
  {
    question: "面の数が最大の正多面体の名前は？",
    answer: "せいにじゅうめんたい",
  },
  {
    question: "累乗を表す右上に書く数の名称は？",
    answer: "しすう",
  },
  {
    question: "本名は夏目金之助。この作家は誰？",
    answer: "なつめそうせき",
  },
  {
    question: "芸人で芥川賞受賞。この作家は誰？",
    answer: "またよしなおき",
  },
  {
    question: "日本初のノーベル文学賞受賞者は？",
    answer: "かわばたやすなり",
  },
  {
    question: "唯一のカ行変格活用の動詞とは何？",
    answer: "くる",
  },
  {
    question: "歳徳神がいる方角を指す言葉は何？",
    answer: "えほう",
  },
  {
    question: "元素周期表で、５番目の元素は何？",
    answer: "ほうそ",
  },
  {
    question: "漢字では魚編に京と書く哺乳類は？",
    answer: "くじら",
  },
  {
    question: "８月にある唯一の国民の祝日は何？",
    answer: "やまのひ",
  },
  {
    question: "南米大陸で最も高い山の名前は何？",
    answer: "あこんかぐあ",
  },
  {
    question: "漢字で木耳と書く食材の名前は何？",
    answer: "きくらげ",
  },
  {
    question: "インドの国技であるスポーツは何？",
    answer: "かばでぃ",
  },
  {
    question: "日本で２番目に高い山の名前は何？",
    answer: "きただけ",
  },
  {
    question: "日本の最西端にある島の名前は何？",
    answer: "よなぐにじま",
  },
  {
    question: "近視用の眼鏡に使うのは何レンズ？",
    answer: "おうれんず",
  },
  {
    question: "早稲田大学の初代総長の名前は何？",
    answer: "おおくましげのぶ",
  },
  {
    question: "一般に結婚指輪はどの指にはめる？",
    answer: "くすりゆび",
  },
  {
    question: "アメリカの二大政党、共和党と何？",
    answer: "みんしゅとう",
  },
  {
    question: "調味料のさしすせそ、さは何の略？",
    answer: "さとう",
  },
  {
    question: "太陽系の惑星で最も小さいのは何？",
    answer: "すいせい",
  },
  {
    question: "日本の最南端にある島の名前は何？",
    answer: "おきのとりしま",
  },
  {
    question: "江戸幕府第１５代将軍の名前は何？",
    answer: "とくがわよしのぶ",
  },
  {
    question: "漫画「チェンソーマン」の作者は？",
    answer: "ふじもとたつき",
  },
  {
    question: "新年のある夜に見る夢を何という？",
    answer: "はつゆめ",
  },
  {
    question: "現在日本で使われている通貨は何？",
    answer: "えん",
  },
  {
    question: "日本の初代内閣総理大臣の名前は？",
    answer: "いとうひろぶみ",
  },
]
let randomQuiz = []
let quizText = ""
let quizTextSplit = ""

/*quizzes配列からランダムに4つの要素（問いと答えのプロパティを持つオブジェクト)を選択し
それら4つを格納した配列を返す関数 */
function quizFetch() {
  let l = quizzes.length
  const a = quizzes.concat()
  let n = Math.min(4, l)
  while (n-- > 0) {
    var i = Math.floor(Math.random() * l)
    randomQuiz.push(a[i])
    a[i] = a[--l]
  }
  return randomQuiz
}

/*マスに格納するために順序を変更した
64文字の連結クイズ文字列を返す関数 */
function quizSplit() {
  quizText =
    randomQuiz[0].question +
    randomQuiz[1].question +
    randomQuiz[2].question +
    randomQuiz[3].question
  const regex = /.{1,4}/g
  const result = quizText.match(regex)
  //文字列を左上、左下、右上、右下のセクションごとに表示するように整形
  let quizSplitArray = []

  for (let i = 0; i < 16; i++) {
    if (i % 2 == 0) {
      quizSplitArray[i] = result[i / 2]
    } else if (i % 2 !== 0) {
      quizSplitArray[i] = result[0.5 * i + 7.5]
    }
  }
  quizTextSplit = quizSplitArray.join("")
  return quizTextSplit
}

quizFetch()
quizSplit()

export { quizTextSplit, quizFetch, quizSplit }
