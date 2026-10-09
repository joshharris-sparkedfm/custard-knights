// Actual final atlas/compositor review. Called only after the full rig checks decode all hero layers.
const canvas=document.createElement('canvas');canvas.width=1680;canvas.height=2480;
const x=canvas.getContext('2d');x.fillStyle='#eedab6';x.fillRect(0,0,canvas.width,canvas.height);
const rows=[...Object.keys(CK_SPRITES.knight.helms).map(helm=>[helm,{kit:{visor:window.CK_QA_VISOR||'closed',helm},hero:1}]),['Rooster Crown',{kit:{visor:window.CK_QA_VISOR||'closed',helm:'roosterCrown'},blade:'goldenWhisk',hero:1}],['Rice Guard',{kit:{visor:window.CK_QA_VISOR||'closed',helm:'riceGuard'},blade:'spoon',hero:1}],['Steve mount',{kit:{visor:window.CK_QA_VISOR||'closed',helm:'great'},fx:{steve:10}}],['Steve Strut',{kit:{visor:window.CK_QA_VISOR||'closed',helm:'great'},pose:'steveStrut',collectionPreview:true,hero:1}]];
const columns=[['S / steel',Math.PI/2,'steel'],['SE / gold',Math.PI/4,'gold'],['E / dark',0,'dark'],['NE / steel',-Math.PI/4,'steel'],['N / gold',-Math.PI/2,'gold'],['Win / dark',Math.PI/2,'dark',true]];
for(let row=0;row<rows.length;row++)for(let col=0;col<columns.length;col++){
 const [label,patch]=rows[row],[direction,face,metal,win]=columns[col],e=CK.mkKnight({id:42,face,blade:'steel',...patch,kit:{visor:window.CK_QA_VISOR||'closed',...patch.kit,metal,plume:'feather'}}),px=col*280+140,py=row*240+38;
 x.fillStyle='#291a33';x.font='bold 16px Arial';x.fillText(label+' · '+direction,col*280+12,py);
 CK.G().over=!!win;CK.G().winners=win?[e]:[];
 CK.withCtx(x,()=>{x.save();x.translate(px,py+144);x.scale(row===8?1.35:2,row===8?1.35:2);CK.drawKnight(e);x.restore();});
}
CK.G().over=false;CK.G().winners=[];
return canvas.toDataURL('image/png');
