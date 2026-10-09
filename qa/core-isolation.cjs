'use strict';
// Run the existing synchronous core assertions without node:test's child process.
// Flush each test name to disk so native termination retains the last entered case.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const source=path.resolve(__dirname,'../tests/mass-battle.test.cjs');
const output=path.resolve(process.argv[2]||path.join(__dirname,'results/core-isolation.jsonl'));
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,'');
const record=data=>fs.appendFileSync(output,JSON.stringify({...data,at:new Date().toISOString()})+'\n');
const requireSource=createRequire(source);let passed=0;
const test=(name,fn)=>{record({event:'start',name});try{const result=fn();if(result&&typeof result.then==='function')throw Error('This diagnostic supports synchronous core tests only');passed++;record({event:'pass',name});}catch(e){record({event:'fail',name,error:e.stack});throw e;}};
record({event:'runtime',version:process.version,execArgv:process.execArgv,source:require('node:crypto').createHash('sha256').update(fs.readFileSync(source)).digest('hex'),core:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../game/mass-battle.js'))).digest('hex')});
vm.runInNewContext(fs.readFileSync(source,'utf8'),{require:name=>name==='node:test'?test:requireSource(name),console,Buffer,structuredClone},{filename:source});
record({event:'complete',passed});console.log('CORE_ISOLATION_PASS '+passed);
