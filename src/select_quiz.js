/*quizzes配列からランダムに4つの要素（問いと答えのプロパティを持つオブジェクト)を選択し
  それら4つを格納した配列を返す関数 */
function quizFetch(quizzes) {
  let randomQuiz = []
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
function quizSplit(randomQuiz) {
  let quizTextSplit = ""
  let quizText =
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

export default { quizFetch, quizSplit }
