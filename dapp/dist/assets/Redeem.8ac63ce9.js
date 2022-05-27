import{d as I,g as z,u as V,r as T,c as o,G as D,x as r,y as c,w as G,o as i,a as u,e as m,l as g,m as S,n,b as d,p as N,t as M,A as O,z as P,k as B,M as h,q as _,B as R}from"./index.269f9eaf.js";const Z={class:"view-collection"},L={key:0,class:"container my-3"},X=d("h1",null,"Loading Zoo...",-1),q=d("p",null,"The more assets in the Zoo, the longer this will take...",-1),U={key:1,class:"container my-3"},$=d("h1",null,[d("span",{class:"gold"},"Your"),N(" 1 of 1s")],-1),F=["disabled"],H=d("i",{class:"bi bi-award"},null,-1),J=I({setup(Y){const t=P,y=z(),a=V(B),l=T(!0),E=o(()=>a.state.userAssets),v=o(()=>a.state.txnPending),b=o(()=>a.getters[D.ACTIVE_ACCOUNT_ADDRESS]),f=o(()=>y.query.address||b.value),w=o(()=>E.value.filter(e=>e.metadata.claimable!==void 0&&e.metadata.claimable)),s=T({[t(r.address)]:new Set,[t(c.address)]:new Set}),A=o(()=>s.value[t(r.address)].size+s.value[t(c.address)].size),k=e=>{s.value[e.contract].has(e.id)?s.value[e.contract].delete(e.id):s.value[e.contract].add(e.id)},C=(e,p)=>s.value[e]===void 0?!1:s.value[e].has(p),x=async()=>{if(s.value[t(r.address)].size>0){a.commit(h.SET_TXN_PENDING,!0);const e=Array.from(s.value[t(r.address)].values());await a.dispatch(_.CLAIM,{ids:e,contractAddress:t(r.address)})}if(s.value[t(c.address)].size>0){a.commit(h.SET_TXN_PENDING,!0);const e=Array.from(s.value[t(c.address)].values());await a.dispatch(_.CLAIM,{ids:e,contractAddress:t(c.address)})}alert("One of Ones claimed, redirecting to My Zoo"),a.commit(h.SET_TXN_PENDING,!1),R.push({name:"ViewZoo"})};return G(()=>{l.value=!0,a.dispatch(_.FETCH_ASSETS,f.value).then(()=>{l.value=!1}).catch(console.error)}),(e,p)=>(i(),u("div",Z,[l.value?(i(),u("div",L,[X,q,m(g)])):S("",!0),!l.value&&n(f).length>0?(i(),u("div",U,[$,d("button",{class:"btn cz-btn cz-btn--primary float-end my-3",disabled:n(A)<1||n(v),onClick:x},[m(g,{spinning:n(v)},null,8,["spinning"]),H,N(" Redeem "+M(n(A)),1)],8,F),m(O,{assets:n(w),"show-title":!1,"show-feature":!1,"show-lightbox":!1,interactive:!0,highlight:C,onAssetSelected:k},null,8,["assets"])])):S("",!0)]))}});export{J as default};
