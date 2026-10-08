// Rear companion holdouts with the procedural arm extended away from its baked rest position.
const canvas=document.createElement('canvas');canvas.width=1840;canvas.height=1500;
const x=canvas.getContext('2d');x.fillStyle='#eedab6';x.fillRect(0,0,canvas.width,canvas.height);
const rows=[['Checker / charge',{cape:'checker',charge:.35}],['Stars / stab',{cape:'stars',swingKind:'stab',swingDur:.18,swing:.095}],['Chevron / heavy',{cape:'chevron',swingKind:'heavy',swingDur:.3,swing:.215,heavyReach:true}],['Tea Towel / charge',{cape:'teaTowel',charge:.35}],['Burnt Toast / stab',{cape:'burntToast',swingKind:'stab',swingDur:.18,swing:.095}],['Trim / recovery',{cape:'trim',swingKind:'light',swingDur:.22,swing:.025}],['Plain / idle',{cape:'plain'}]];
const dirs=[['S',Math.PI/2],['SE',Math.PI/4],['E',0],['NE',-Math.PI/4],['N',-Math.PI/2],['NW',-Math.PI*.75],['W',Math.PI],['SW',Math.PI*.75]];
CK.G().over=false;CK.G().winners=[];
rows.forEach(([label,patch],row)=>dirs.forEach(([direction,face],col)=>{
 const e=CK.mkKnight({id:42,face,blade:'steel',kit:{visor:window.CK_QA_VISOR||'closed',helm:'great',metal:'steel',plume:row%2?'flame':'feather'},...patch}),px=col*230+115,py=row*210+28;
 x.fillStyle='#291a33';x.font='bold 13px Arial';x.fillText(label+' '+direction,col*230+9,py);
 CK.withCtx(x,()=>{x.save();x.translate(px,py+135);x.scale(1.8,1.8);CK.drawKnight(e);x.restore();});
}));
return canvas.toDataURL('image/png');
