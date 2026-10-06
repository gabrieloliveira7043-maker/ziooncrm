const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.goto('file://'+process.cwd()+'/historia.html');await p.waitForTimeout(500);
 const fps=30,dur=27,n=Math.round(fps*dur);
 const dir=process.argv[2];
 for(let i=0;i<n;i++){await p.evaluate(t=>window.render(t),i/fps);await p.screenshot({path:`${dir}/f${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
 await b.close();
})();
