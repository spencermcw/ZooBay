import{d as u,u as _,r as d,c as h,L as m,q as g,o as s,a as t,e as p,l as f,m as o,J as k,n as c,b as n,k as L,p as l}from"./index.b14c6712.js";import{L as v}from"./ListingManagement.63326fc3.js";const y={class:"container"},N=n("h1",null,"Your Completed Listings",-1),B={key:0},C=n("h2",null,"Loading Listings...",-1),S={key:2},T=l(" No Listings Found... "),V=n("br",null,null,-1),x=l(" You may have gotten here too quickly... Try refreshing \u{1F605} "),E=[T,V,x],M=u({setup(F){const a=_(L),e=d(!0),i=h(()=>a.state.listings.filter(r=>r.expired));return m(()=>{a.dispatch(g.FETCH_USER_LISTINGS).then(()=>{e.value=!1}).catch(console.error)}),(r,I)=>(s(),t("div",y,[N,e.value?(s(),t("div",B,[C,p(f)])):o("",!0),e.value?o("",!0):(s(),k(v,{key:1,listings:c(i)},null,8,["listings"])),!e.value&&c(i).length===0?(s(),t("p",S,E)):o("",!0)]))}});export{M as default};
