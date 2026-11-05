/* Input interpretation only. Calculation and server amounts remain integer won. */
'use strict';
var HaeramMoney=(()=>{
 const numeric=/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,4})?$/;
 const digit={영:0,공:0,일:1,이:2,삼:3,사:4,오:5,육:6,칠:7,팔:8,구:9};
 const small={십:10,백:100,천:1000},large={만:10000,억:100000000};
 function quantity(text){
  if(numeric.test(text))return Number(text.replace(/,/g,''));
  const tokens=text.match(/\d[\d,]*(?:\.\d{1,4})?|[영공일이삼사오육칠팔구십백천만억]/g);
  if(!tokens||tokens.join('')!==text)return null;
  let total=0,section=0,number=null,lastSmall=10000,lastLarge=Infinity;
  for(const token of tokens){
   if(numeric.test(token)||Object.hasOwn(digit,token)){
    if(number!==null)return null;
    number=Object.hasOwn(digit,token)?digit[token]:Number(token.replace(/,/g,''));
   }else if(small[token]){
    if(small[token]>=lastSmall||number===0)return null;
    section+=(number===null?1:number)*small[token];number=null;lastSmall=small[token];
   }else{
    if(large[token]>=lastLarge)return null;
    section+=number===null?0:number;
    total+=(section||1)*large[token];section=0;number=null;lastSmall=10000;lastLarge=large[token];
   }
  }
  const result=total+section+(number===null?0:number);
  return Number.isFinite(result)?result:null;
 }
 function inputValue(won){return (won/10000).toLocaleString('ko-KR',{maximumFractionDigits:4});}
 function label(won){
  if(won<10000)return won.toLocaleString('ko-KR')+'원';
  if(won>=100000000&&won%100000000===0)return (won/100000000).toLocaleString('ko-KR')+'억원';
  return inputValue(won)+'만원';
 }
 function parse(raw,field){
  if(!['income','debt'].includes(field))return null;
  const original=String(raw).trim(),text=original.normalize('NFKC').replace(/\s/g,'');
  if(!text||text.length>32)return null;
  const hasWon=text.endsWith('원'),body=hasWon?text.slice(0,-1):text;
  if(body.includes('원'))return null;
  const value=quantity(body);
  if(value===null||value<0)return null;
  const explicitCurrency=hasWon||/[만억]/.test(body);
  const simpleManwon=body.endsWith('만')&&numeric.test(body.slice(0,-1));
  const plainAmount=numeric.test(body)?value:simpleManwon?Number(body.slice(0,-1).replace(/,/g,'')):null;
  const threshold=field==='income'?100000:1000000;
  const inferred=plainAmount!==null&&plainAmount>=threshold&&(!hasWon||simpleManwon);
  const candidate=inferred?plainAmount:explicitCurrency?value:value*10000;
  const won=Math.round(candidate);
  if(!Number.isSafeInteger(won)||Math.abs(candidate-won)>0.00001)return null;
  const alternative=inferred?plainAmount*10000:null;
  return {won,canonical:inputValue(won),inferred,original,alternativeWon:Number.isSafeInteger(alternative)?alternative:null,
   notice:inferred?label(won)+'으로 이해했어요.':explicitCurrency?label(won)+'으로 입력했어요.':''};
 }
 return Object.freeze({parse,inputValue,label});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=HaeramMoney;
