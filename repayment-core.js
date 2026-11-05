/* Haeram reference calculator. 2026 official median income; base living cost 60%.
   Sources: https://www.mohw.go.kr/menu.es?mid=a10708010500
   https://slb.scourt.go.kr/dcboard/new/DcNewsViewAction.work?cbub_code=000221&gubun=41&pageIndex=2&seqnum=19158
   Reference only: assets, priority claims, additional living costs and interest are not modeled. */
'use strict';
var HaeramRepayment = (() => {
  const YEAR=2026, MONTHS=36, VERSION='2026-11-v2';
  const median=Object.freeze([0,2564238,4199292,5359036,6494738,7556719,8555952]);
  const contactTimes=Object.freeze(['오전 9시~12시','오후 12시~2시','오후 2시~4시','오후 4시~6시','시간을 먼저 조율하고 싶어요']);
  function parseManwon(raw){
    const value=String(raw).trim();
    if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value))return null;
    const won=Math.round(Number(value.replace(/,/g,''))*10000);
    return Number.isSafeInteger(won)?won:null;
  }
  function calculate(input,currentYear){
    const {monthlyNet,debt,people}=input;
    if(!Number.isSafeInteger(monthlyNet)||monthlyNet<0||monthlyNet>100000000||!Number.isSafeInteger(debt)||debt<=0||debt>10000000000||!Number.isInteger(people)||people<1||people>6)return {status:'invalid'};
    const base={basisYear:YEAR,version:VERSION,months:MONTHS,monthlyNet,debt,people};
    if(currentYear!==YEAR)return {...base,status:'stale'};
    if(debt>1000000000)return {...base,status:'scope-review'};
    const living=Math.round(median[people]*.6),available=Math.max(0,monthlyNet-living);
    const values={...base,living,available};
    if(available===0)return {...values,status:'living-review'};
    if(available*MONTHS>=debt)return {...values,status:'full-repayment-review'};
    return {...values,status:'estimate',monthly:available,total:available*MONTHS};
  }
  function displayAmount(won){return won<10000?'1만원 미만':Math.round(won/10000).toLocaleString('ko-KR')+'만원';}
  function guidance(result){
    const common={encouragement:'은행원 출신 김해람 법무사가 채무 내역과 생활 사정을 꼼꼼히 살펴, 줄일 수 있는 변제 부담까지 확인합니다.',rangeNote:'더 구체적인 금액은 상담에서 확인해요. 세부 사정에 따라 지금보다 낮아지거나 높아질 수 있어요.'};
    const messages={
      'estimate':{lead:'매달 준비할 금액, 먼저 가늠해보면',headline:'월 약 '+(result.monthly?displayAmount(result.monthly):'')},
      'living-review':{headline:'생활비를 지키는 방향부터',detail:'지금은 생활비와 상환 여력을 함께 확인할 때예요. 소득과 지출 사정을 살펴 내게 맞는 절차를 상담에서 찾아보세요.'},
      'full-repayment-review':{headline:'갚아나갈 여력을 확인했어요',detail:'생활비를 뺀 여력은 월 약 '+(result.available?displayAmount(result.available):'')+'이에요. 입력값으로는 36개월 동안 원금 전액을 갚는 범위라, 이자와 기간까지 함께 확인하면 더 정확한 계획을 세울 수 있어요.'},
      'scope-review':{headline:'채무 내역을 함께 살펴봐요',detail:'입력하신 채무 규모는 간이 계산 범위를 넘어가요. 구체적인 채무 내역부터 확인해 알맞은 절차를 안내할게요.'},
      'stale':{headline:'새 기준을 확인하고 있어요',detail:'현재 계산기는 2026년 기준이에요. 상담에서 최신 기준으로 함께 살펴볼게요.'}
    };
    return {...common,...messages[result.status]};
  }
  function note(result){
    if(!result||result.status==='invalid')return '';
    const titles={'estimate':'기본산식 참고액','living-review':'생활비·상환여력 확인 필요','full-repayment-review':'원금 전액 변제 범위·기간/이자 별도 검토','scope-review':'채무 규모 별도 검토','stale':'연도 기준 갱신 후 재계산 필요'};
    const lines=['[셀프체크 화면 안내 기록 / '+VERSION+']','세후 월평균 소득 '+result.monthlyNet.toLocaleString('ko-KR')+'원 · 담보 없는 채무 '+result.debt.toLocaleString('ko-KR')+'원 · 생계비 적용 인원(가정) '+result.people+'명'];
    if(result.living!==undefined)lines.push('기본생계비 '+result.living.toLocaleString('ko-KR')+'원 · 생계비 차감 후 여력 '+result.available.toLocaleString('ko-KR')+'원/월');
    const shown=guidance(result);
    lines.push('화면 표시: '+shown.headline);
    if(shown.detail)lines.push('화면 설명: '+shown.detail);
    lines.push('함께 표시한 안내: '+shown.encouragement+' '+shown.rangeNote);
    lines.push(titles[result.status]+(result.monthly!==undefined?' '+result.monthly.toLocaleString('ko-KR')+'원/월':''));
    lines.push('2026 기본생계비 60%·36개월 가정. 재산·우선채무·추가생계비·이자 미반영. 실제 변제금은 상담 및 법원 심사로 달라질 수 있음.');
    return lines.join('\n');
  }
  return Object.freeze({YEAR,MONTHS,VERSION,contactTimes,parseManwon,calculate,guidance,displayAmount,note});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=HaeramRepayment;
