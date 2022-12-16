<template>
    <div class="rule"> 
      <div class="rule_title"><span>Rule</span> of the Game</div>
      <div class="listbox">
      <ul>
        <li><span class="uline">自分の番に出来るのは「クイズに回答する」か「石を置くか」</span></li>
        <li><span class="uline">石を置けるのにパスすることは出来ない</span></li>
        <li><span class="uline">パスの判定は自動で行われます</span></li>
        <li><span class="uline">見えるのは自分の色の石にある文字だけ</span></li>
        <li><span class="uline">答えはひらがなで</span></li>
        <li><span class="uline">クイズで4問すべてに正解したプレイヤーの勝ち</span></li>
      </ul>
    </div>
    </div>
  </template>

<script>
</script>

<style scoped>
.rule{
  width: 100%;
}
.rule_title{
  width: 922px;
  height: 89px;
  left: 229px;
  top: 108px;
  margin:auto;

  font-family: 'Zen Dots';
  font-style: normal;
  font-weight: 400;
  font-size: 64px;
  line-height: 77px;
  text-align: center;
  color: #000000;
}
.rule_title span{
  color: #04D2FF;
}
.listbox{
  width: 1125px;
  height: 598px;
  left: 154px;
  top: 227px;
  margin: auto;

  font-family: 'Zen Dots';
  font-style: normal;
  font-weight: 400;
  font-size: 36px;
  line-height: 43px;
  text-align: center;

  color: #000000;

}
.listbox li{
  margin: auto;
  padding-top:20px; 
  padding-bottom:20px;
  color: #04D2FF;
  border-bottom: dotted 2px #cecccd;
}
.listbox span.uline{
  font-family: 'Zen Dots';
  font-style: normal;
  font-weight: 400;
  font-size: 36px;
  line-height: 43px;
  text-align: center;
  
  color: #000000;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
</style>